// src/shared/components/ui/types.ts
// UI Components Interfaces - Type definitions for all UI components

// ========================
// LAYOUT COMPONENT INTERFACES
// ========================

// Card Component
export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// Stat Card Component
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

// Page Title Component
export interface PageTitleProps {
  title: string;
  children?: React.ReactNode;
}

// Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

// Modal Component
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Table Component
export interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

// Badge Component
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

// Alert Component
export interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  onClose?: () => void;
}

// Toast Component
export interface ToastMessage {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

// ========================
// FORM COMPONENT INTERFACES
// ========================

// Input Component
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// Select Component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

// Checkbox Component
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// Radio Component
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// File Input Component
export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}