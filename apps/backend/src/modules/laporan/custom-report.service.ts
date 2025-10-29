import { LaporanRepository } from './laporan.repository';
import { AppError } from '../../utils/errors';

class CustomReportService {
  static async generateCustomReport(filters: any, fields: string[], reportType: string) {
    try {
      // Validate inputs
      if (!reportType) {
        throw new AppError('Report type is required', 400);
      }
      
      if (!Array.isArray(fields) || fields.length === 0) {
        throw new AppError('At least one field must be selected', 400);
      }
      
      // Generate report based on type and filters
      let reportData: any[] = [];
      
      switch (reportType) {
        case 'pegawai':
          reportData = await this.generateCustomEmployeeReport(filters, fields);
          break;
        case 'absensi':
          reportData = await this.generateCustomAttendanceReport(filters, fields);
          break;
        case 'penggajian':
          reportData = await this.generateCustomPayrollReport(filters, fields);
          break;
        case 'cuti':
          reportData = await this.generateCustomLeaveReport(filters, fields);
          break;
        case 'kinerja':
          reportData = await this.generateCustomPerformanceReport(filters, fields);
          break;
        default:
          throw new AppError(`Unsupported report type: ${reportType}`, 400);
      }
      
      return reportData;
    } catch (error: any) {
      throw new AppError(`Error generating custom report: ${error.message}`, 500);
    }
  }
  
  private static async generateCustomEmployeeReport(filters: any, fields: string[]) {
    const db = await LaporanRepository['generateLaporanPegawai'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance
    
    // Build dynamic query based on selected fields and filters
    let selectFields = fields.join(', ');
    let query = `SELECT ${selectFields} FROM pegawai WHERE 1=1`;
    const queryParams: any[] = [];
    
    // Apply filters
    if (filters.department) {
      query += ' AND department = ?';
      queryParams.push(filters.department);
    }
    
    if (filters.position) {
      query += ' AND position = ?';
      queryParams.push(filters.position);
    }
    
    if (filters.isActive !== undefined) {
      query += ' AND isActive = ?';
      queryParams.push(filters.isActive ? 1 : 0);
    }
    
    if (filters.joinDateFrom) {
      query += ' AND joinDate >= ?';
      queryParams.push(filters.joinDateFrom);
    }
    
    if (filters.joinDateTo) {
      query += ' AND joinDate <= ?';
      queryParams.push(filters.joinDateTo);
    }
    
    query += ' ORDER BY name ASC';
    
    const result = await dbInstance.all(query, queryParams);
    return result;
  }
  
  private static async generateCustomAttendanceReport(filters: any, fields: string[]) {
    const db = await LaporanRepository['generateLaporanPegawai'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance
    
    // Build dynamic query based on selected fields and filters
    let selectFields = fields.join(', ');
    let query = `SELECT ${selectFields} FROM absensi a JOIN pegawai p ON a.employeeId = p.id WHERE 1=1`;
    const queryParams: any[] = [];
    
    // Apply filters
    if (filters.dateFrom) {
      query += ' AND a.date >= ?';
      queryParams.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query += ' AND a.date <= ?';
      queryParams.push(filters.dateTo);
    }
    
    if (filters.employeeId) {
      query += ' AND a.employeeId = ?';
      queryParams.push(filters.employeeId);
    }
    
    if (filters.status) {
      query += ' AND a.status = ?';
      queryParams.push(filters.status);
    }
    
    query += ' ORDER BY a.date DESC';
    
    const result = await dbInstance.all(query, queryParams);
    return result;
  }
  
  private static async generateCustomPayrollReport(filters: any, fields: string[]) {
    const db = await LaporanRepository['generateLaporanPegawai'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance
    
    // Build dynamic query based on selected fields and filters
    let selectFields = fields.join(', ');
    let query = `SELECT ${selectFields} FROM penggajian pa JOIN pegawai p ON pa.employeeId = p.id WHERE 1=1`;
    const queryParams: any[] = [];
    
    // Apply filters
    if (filters.month && filters.year) {
      query += ' AND pa.period LIKE ?';
      queryParams.push(`${filters.year}-${filters.month}%`);
    }
    
    if (filters.employeeId) {
      query += ' AND pa.employeeId = ?';
      queryParams.push(filters.employeeId);
    }
    
    query += ' ORDER BY pa.period DESC';
    
    const result = await dbInstance.all(query, queryParams);
    return result;
  }
  
  private static async generateCustomLeaveReport(filters: any, fields: string[]) {
    const db = await LaporanRepository['generateLaporanPegawai'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance
    
    // Build dynamic query based on selected fields and filters
    let selectFields = fields.join(', ');
    let query = `SELECT ${selectFields} FROM permintaan_cuti l JOIN pegawai p ON l.employeeId = p.id WHERE 1=1`;
    const queryParams: any[] = [];
    
    // Apply filters
    if (filters.month && filters.year) {
      query += ' AND l.startDate LIKE ?';
      queryParams.push(`${filters.year}-${filters.month}%`);
    }
    
    if (filters.employeeId) {
      query += ' AND l.employeeId = ?';
      queryParams.push(filters.employeeId);
    }
    
    if (filters.status) {
      query += ' AND l.status = ?';
      queryParams.push(filters.status);
    }
    
    if (filters.leaveType) {
      query += ' AND l.leaveType = ?';
      queryParams.push(filters.leaveType);
    }
    
    query += ' ORDER BY l.startDate DESC';
    
    const result = await dbInstance.all(query, queryParams);
    return result;
  }
  
  private static async generateCustomPerformanceReport(filters: any, fields: string[]) {
    const db = await LaporanRepository['generateLaporanPegawai'](); // Just to get db connection
    const dbInstance = (db as any).constructor; // Get db instance
    
    // Build dynamic query based on selected fields and filters
    let selectFields = fields.join(', ');
    let query = `SELECT ${selectFields} FROM penilaian_kinerja pe JOIN pegawai p ON pe.employeeId = p.id WHERE 1=1`;
    const queryParams: any[] = [];
    
    // Apply filters
    if (filters.month && filters.year) {
      query += ' AND pe.reviewDate LIKE ?';
      queryParams.push(`${filters.year}-${filters.month}%`);
    }
    
    if (filters.employeeId) {
      query += ' AND pe.employeeId = ?';
      queryParams.push(filters.employeeId);
    }
    
    if (filters.status) {
      query += ' AND pe.status = ?';
      queryParams.push(filters.status);
    }
    
    query += ' ORDER BY pe.reviewDate DESC';
    
    const result = await dbInstance.all(query, queryParams);
    return result;
  }
  
  static async getReportMetadata() {
    return {
      reportTypes: [
        { value: 'pegawai', label: 'Data Pegawai' },
        { value: 'absensi', label: 'Absensi' },
        { value: 'penggajian', label: 'Penggajian' },
        { value: 'cuti', label: 'Cuti' },
        { value: 'kinerja', label: 'Kinerja' }
      ],
      availableFields: {
        pegawai: [
          'id', 'nip', 'name', 'email', 'position', 'department', 'joinDate',
          'jenis_kelamin', 'isActive', 'address', 'phone', 'religion'
        ],
        absensi: [
          'employeeId', 'date', 'clockIn', 'clockOut', 'status', 'workDuration'
        ],
        penggajian: [
          'employeeId', 'period', 'baseSalary', 'totalIncome', 'totalDeductions', 'netSalary'
        ],
        cuti: [
          'employeeId', 'employeeName', 'leaveType', 'startDate', 'endDate', 'status'
        ],
        kinerja: [
          'employeeId', 'employeeName', 'period', 'overallScore', 'status', 'reviewDate'
        ]
      },
      filterOptions: {
        pegawai: [
          { name: 'department', type: 'text', label: 'Departemen' },
          { name: 'position', type: 'text', label: 'Posisi' },
          { name: 'isActive', type: 'boolean', label: 'Status Aktif' },
          { name: 'joinDateFrom', type: 'date', label: 'Tanggal Bergabung (Dari)' },
          { name: 'joinDateTo', type: 'date', label: 'Tanggal Bergabung (Sampai)' }
        ],
        absensi: [
          { name: 'dateFrom', type: 'date', label: 'Tanggal (Dari)' },
          { name: 'dateTo', type: 'date', label: 'Tanggal (Sampai)' },
          { name: 'employeeId', type: 'text', label: 'ID Pegawai' },
          { name: 'status', type: 'select', label: 'Status', options: ['hadir', 'izin', 'sakit', 'cuti', 'alpa'] }
        ],
        penggajian: [
          { name: 'month', type: 'number', label: 'Bulan' },
          { name: 'year', type: 'number', label: 'Tahun' },
          { name: 'employeeId', type: 'text', label: 'ID Pegawai' }
        ],
        cuti: [
          { name: 'month', type: 'number', label: 'Bulan' },
          { name: 'year', type: 'number', label: 'Tahun' },
          { name: 'employeeId', type: 'text', label: 'ID Pegawai' },
          { name: 'status', type: 'select', label: 'Status', options: ['menunggu', 'disetujui', 'ditolak'] },
          { name: 'leaveType', type: 'select', label: 'Jenis Cuti', options: ['Cuti Tahunan', 'Cuti Sakit', 'Cuti Melahirkan', 'Izin', 'Alpa'] }
        ],
        kinerja: [
          { name: 'month', type: 'number', label: 'Bulan' },
          { name: 'year', type: 'number', label: 'Tahun' },
          { name: 'employeeId', type: 'text', label: 'ID Pegawai' },
          { name: 'status', type: 'select', label: 'Status', options: ['Draft', 'Submitted', 'Reviewed', 'Completed'] }
        ]
      }
    };
  }
}

export default CustomReportService;