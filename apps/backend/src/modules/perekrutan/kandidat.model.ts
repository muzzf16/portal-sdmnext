// src/modules/perekrutan/kandidat.model.ts

export interface Kandidat {
  id: string;
  name: string;
  email: string;
  phone: string;
  position_applied: string;
  status: string;
  resume_url: string;
  cover_letter: string;
  application_date: string;
  notes: string;
  created_at: string;
}