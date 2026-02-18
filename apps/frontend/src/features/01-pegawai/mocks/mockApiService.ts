// src/features/01-pegawai/mocks/mockApiService.ts
// Mock API service for testing the employee module

import { mockPegawai, mockRiwayatJabatan, mockPelatihan } from './mockData';
import { Pegawai, RiwayatJabatan, Pelatihan } from '../types';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockGetPegawai = async (): Promise<{ success: boolean; data: Pegawai[] }> => {
  await delay(500); // Simulate network delay
  return {
    success: true,
    data: mockPegawai
  };
};

export const mockGetPegawaiById = async (id: string): Promise<{ success: boolean; data: Pegawai | null }> => {
  await delay(300); // Simulate network delay
  const employee = mockPegawai.find(p => p.id === id) || null;
  return {
    success: true,
    data: employee
  };
};

export const mockGetRiwayatJabatan = async (employeeId: string): Promise<{ success: boolean; data: RiwayatJabatan[] }> => {
  await delay(400); // Simulate network delay
  const history = mockRiwayatJabatan.filter(r => r.pegawai_id === parseInt(employeeId));
  return {
    success: true,
    data: history
  };
};

export const mockGetPelatihan = async (employeeId: string): Promise<{ success: boolean; data: Pelatihan[] }> => {
  await delay(400); // Simulate network delay
  const trainings = mockPelatihan.filter(p => p.pegawai_id === parseInt(employeeId));
  return {
    success: true,
    data: trainings
  };
};

// Mock create employee
export const mockCreatePegawai = async (pegawai: Omit<Pegawai, 'id'>): Promise<{ success: boolean; data: Pegawai }> => {
  await delay(600); // Simulate network delay
  const newEmployee = {
    ...pegawai,
    id: (Math.max(...mockPegawai.map(p => parseInt(p.id))) + 1).toString()
  } as Pegawai;

  // In a real implementation, we would add to the mock data
  // mockPegawai.push(newEmployee);

  return {
    success: true,
    data: newEmployee
  };
};

// Mock update employee
export const mockUpdatePegawai = async (id: string, pegawai: Partial<Pegawai>): Promise<{ success: boolean; data: Pegawai }> => {
  await delay(600); // Simulate network delay
  const index = mockPegawai.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Employee not found');
  }

  const updatedEmployee = {
    ...mockPegawai[index],
    ...pegawai
  } as Pegawai;

  // In a real implementation, we would update the mock data
  // mockPegawai[index] = updatedEmployee;

  return {
    success: true,
    data: updatedEmployee
  };
};

// Mock delete employee
export const mockDeletePegawai = async (id: string): Promise<{ success: boolean; data: boolean }> => {
  await delay(600); // Simulate network delay
  const index = mockPegawai.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Employee not found');
  }

  // In a real implementation, we would remove from the mock data
  // mockPegawai.splice(index, 1);

  return {
    success: true,
    data: true
  };
};