import { Request, Response } from 'express';
import { HolidaysRepository } from './holidays.repository';
import * as crypto from 'crypto';

export const getAllHolidays = async (req: Request, res: Response): Promise<void> => {
  try {
    const holidays = await HolidaysRepository.findAll();
    res.json({ success: true, data: holidays });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHoliday = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tanggal, deskripsi } = req.body;
    if (!tanggal || !deskripsi) {
      res.status(400).json({ success: false, message: 'Tanggal dan deskripsi wajib diisi' });
      return;
    }
    const newHoliday = {
      id: crypto.randomUUID(),
      tanggal,
      deskripsi
    };
    await HolidaysRepository.create(newHoliday);
    res.status(201).json({ success: true, data: newHoliday });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, message: 'Tanggal libur sudah ada' });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHoliday = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { tanggal, deskripsi } = req.body;
    const holiday = await HolidaysRepository.findById(id);
    if (!holiday) {
      res.status(404).json({ success: false, message: 'Hari libur tidak ditemukan' });
      return;
    }
    await HolidaysRepository.update(id, { tanggal, deskripsi });
    const updated = await HolidaysRepository.findById(id);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHoliday = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const holiday = await HolidaysRepository.findById(id);
    if (!holiday) {
      res.status(404).json({ success: false, message: 'Hari libur tidak ditemukan' });
      return;
    }
    await HolidaysRepository.delete(id);
    res.json({ success: true, message: 'Hari libur berhasil dihapus' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
