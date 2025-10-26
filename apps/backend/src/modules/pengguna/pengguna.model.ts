
// src/modules/pengguna/pengguna.model.ts

export interface Pengguna {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional, as it won't be returned in many cases
  role: string;
  employeeId: string;
}
