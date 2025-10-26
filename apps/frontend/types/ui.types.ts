export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Notifikasi {
  id: number;
  message: string;
  read: boolean;
}
