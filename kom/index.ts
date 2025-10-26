// UI Components Index - Main export file
export { default as LayoutComponents } from './LayoutComponents';
export { default as FormComponents } from './FormComponents';

// Export individual components for direct usage
export { 
  // Layout Components
  Card,
  StatCard, 
  PageTitle, 
  Button, 
  Modal,
  // Export types for layout components
  type CardProps,
  type StatCardProps,
  type ButtonProps,
  type ModalProps,
} from './LayoutComponents';

// Export form components
export { 
  Input as FormInput,
  Select as FormSelect,
  Textarea as FormTextarea,
  Checkbox,
  Radio
} from './FormComponents';

// Export types for form components
export type {
  InputProps,
  SelectProps,
  TextareaProps,
  CheckboxProps,
  RadioProps
} from './FormComponents';

