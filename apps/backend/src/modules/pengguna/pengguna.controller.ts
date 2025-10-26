
// src/modules/pengguna/pengguna.controller.ts
import PenggunaService from './pengguna.service';
import { Request, Response, NextFunction } from 'express';

class PenggunaController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { token, user } = await PenggunaService.login(email, password);
      
      res.status(200).json({ 
        token,
        user
      });
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await PenggunaService.register(name, email, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAllPengguna(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await PenggunaService.getAllPengguna();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getPenggunaById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await PenggunaService.getPenggunaById(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updatePengguna(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedUser = await PenggunaService.updatePengguna(id, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  static async deletePengguna(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PenggunaService.deletePengguna(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default PenggunaController;
