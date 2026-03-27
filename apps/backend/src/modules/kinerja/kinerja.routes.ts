import { NextFunction, Request, Response, Router } from 'express';
import KinerjaController from './kinerja.controller';
import { authenticateToken, restrictTo } from '../../middleware/authMiddleware';
import { PenilaianKinerjaRepository } from './penilaianKinerja.repository';

const router = Router();

const MANAGER_ROLES = ['admin', 'pimpinan', 'supervisor'] as const;

const getRequestActorId = (req: Request) => String(req.user?.employeeId || req.user?.id || '');

const ensureEmployeeReviewScope = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  if (userRole === 'employee' && req.params.id !== getRequestActorId(req)) {
    return res.status(403).json({ success: false, message: 'Anda hanya dapat mengakses penilaian milik Anda sendiri' });
  }
  return next();
};

const ensureOwnedReviewAccess = async (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  if (MANAGER_ROLES.includes((userRole || '') as typeof MANAGER_ROLES[number])) {
    return next();
  }

  if (userRole !== 'employee') {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
  }

  const review = await PenilaianKinerjaRepository.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, message: 'Performance review not found' });
  }

  if (String(review.employeeId) !== getRequestActorId(req)) {
    return res.status(403).json({ success: false, message: 'Anda hanya dapat mengubah penilaian milik Anda sendiri' });
  }

  return next();
};

router.use(authenticateToken);

router.get('/', restrictTo(...MANAGER_ROLES), KinerjaController.getAllPenilaianKinerja);
router.get('/employee/:id', restrictTo('admin', 'pimpinan', 'supervisor', 'employee'), ensureEmployeeReviewScope, KinerjaController.getPenilaianKinerjaByEmployeeId);
router.get('/:id', restrictTo(...MANAGER_ROLES), KinerjaController.getPenilaianKinerjaById);
router.post('/', restrictTo(...MANAGER_ROLES), KinerjaController.createPenilaianKinerja);
router.put('/:id', restrictTo(...MANAGER_ROLES), KinerjaController.updatePenilaianKinerja);
router.put('/:id/feedback', restrictTo('admin', 'pimpinan', 'supervisor', 'employee'), ensureOwnedReviewAccess, KinerjaController.addFeedbackKinerja);
router.put('/:id/self-assessment', restrictTo('admin', 'pimpinan', 'supervisor', 'employee'), ensureOwnedReviewAccess, KinerjaController.submitSelfAssessment);
router.put('/:id/transition', restrictTo(...MANAGER_ROLES), KinerjaController.transitionStatus);
router.delete('/:id', restrictTo(...MANAGER_ROLES), KinerjaController.deletePenilaianKinerja);

export default router;
