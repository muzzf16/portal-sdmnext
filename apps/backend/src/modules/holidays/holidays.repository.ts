import { openDb } from '../../config/db';
import { Holiday } from './holidays.model';

export class HolidaysRepository {
  static async findAll(): Promise<Holiday[]> {
    const db = await openDb();
    return db.all('SELECT * FROM holidays ORDER BY tanggal ASC');
  }

  static async findById(id: string): Promise<Holiday | undefined> {
    const db = await openDb();
    return db.get('SELECT * FROM holidays WHERE id = ?', [id]);
  }

  static async create(holiday: Holiday): Promise<void> {
    const db = await openDb();
    await db.run(
      'INSERT INTO holidays (id, tanggal, deskripsi) VALUES (?, ?, ?)',
      [holiday.id, holiday.tanggal, holiday.deskripsi]
    );
  }

  static async update(id: string, holiday: Partial<Holiday>): Promise<void> {
    const db = await openDb();
    if (holiday.tanggal && holiday.deskripsi) {
        await db.run('UPDATE holidays SET tanggal = ?, deskripsi = ? WHERE id = ?', [holiday.tanggal, holiday.deskripsi, id]);
    } else if (holiday.tanggal) {
        await db.run('UPDATE holidays SET tanggal = ? WHERE id = ?', [holiday.tanggal, id]);
    } else if (holiday.deskripsi) {
        await db.run('UPDATE holidays SET deskripsi = ? WHERE id = ?', [holiday.deskripsi, id]);
    }
  }

  static async delete(id: string): Promise<void> {
    const db = await openDb();
    await db.run('DELETE FROM holidays WHERE id = ?', [id]);
  }
}
