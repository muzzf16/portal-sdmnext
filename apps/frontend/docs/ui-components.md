# UI Components Documentation

## Overview

This document provides documentation for the reusable UI components created for the HRMS application. These components follow modern design principles with accessibility, responsiveness, and consistency in mind.

## Component Library

### 1. Card Component
A versatile container component for displaying content with consistent styling.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | Content to display inside the card |
| className | string | No | Additional CSS classes to apply |

#### Usage
```tsx
import { Card } from '@/shared/components/ui';

<Card className="bg-white p-6 rounded-lg shadow">
  <h3 className="text-lg font-semibold mb-2">Card Title</h3>
  <p className="text-gray-600">Card content goes here</p>
</Card>
```

### 2. StatCard Component
A specialized card for displaying statistical information with an icon.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| title | string | Yes | Title of the statistic |
| value | string \| number | Yes | Value to display |
| icon | ReactNode | Yes | Icon to display |
| color | string | Yes | Background color class for the icon container |

#### Usage
```tsx
import { StatCard } from '@/shared/components/ui';
import { Users } from 'lucide-react';

<StatCard 
  title="Total Employees" 
  value={125} 
  icon={<Users />} 
  color="bg-blue-100" 
/>
```

### 3. PageTitle Component
A component for displaying page titles with optional actions.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| title | string | Yes | Page title to display |
| children | ReactNode | No | Optional actions or additional content |

#### Usage
```tsx
import { PageTitle } from '@/shared/components/ui';

<PageTitle title="Dashboard">
  <button className="px-4 py-2 bg-blue-500 text-white rounded">
    Add New
  </button>
</PageTitle>
```

### 4. Button Component
A customizable button component with multiple variants and states.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | Button content |
| variant | 'primary' \| 'secondary' \| 'danger' \| 'success' \| 'outline' \| 'warning' | No | Button style variant (default: 'primary') |
| size | 'sm' \| 'md' \| 'lg' | No | Button size (default: 'md') |
| loading | boolean | No | Loading state (default: false) |
| ...props | ButtonHTMLAttributes | No | All standard button attributes |

#### Usage
```tsx
import { Button } from '@/shared/components/ui';

<Button variant="primary" size="lg">
  Click Me
</Button>

<Button variant="outline" loading>
  Loading...
</Button>
```

### 5. Modal Component
A modal dialog component for displaying overlays.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Controls modal visibility |
| onClose | () => void | Yes | Function to close the modal |
| title | string | Yes | Modal title |
| children | ReactNode | Yes | Modal content |
| size | 'sm' \| 'md' \| 'lg' \| 'xl' | No | Modal size (default: 'md') |

#### Usage
```tsx
import { Modal } from '@/shared/components/ui';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
  title="Confirmation"
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

### 6. Input Component
A form input component with label and error handling.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | string | Yes | Input label |
| id | string | Yes | Input ID for accessibility |
| error | string | No | Error message to display |
| ...props | InputHTMLAttributes | No | All standard input attributes |

#### Usage
```tsx
import { Input } from '@/shared/components/ui';

<Input 
  label="Email Address" 
  id="email" 
  type="email" 
  error={errors.email}
  value={formData.email}
  onChange={(e) => setFormData({...formData, email: e.target.value})}
/>
```

### 7. Select Component
A form select component with label and error handling.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | string | Yes | Select label |
| id | string | Yes | Select ID for accessibility |
| error | string | No | Error message to display |
| options | { value: string; label: string }[] | Yes | Select options |
| ...props | SelectHTMLAttributes | No | All standard select attributes |

#### Usage
```tsx
import { Select } from '@/shared/components/ui';

<Select 
  label="Department" 
  id="department" 
  error={errors.department}
  options={[
    { value: 'it', label: 'IT' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' }
  ]}
  value={formData.department}
  onChange={(e) => setFormData({...formData, department: e.target.value})}
/>
```

### 8. Textarea Component
A form textarea component with label and error handling.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | string | Yes | Textarea label |
| id | string | Yes | Textarea ID for accessibility |
| error | string | No | Error message to display |
| ...props | TextareaHTMLAttributes | No | All standard textarea attributes |

#### Usage
```tsx
import { Textarea } from '@/shared/components/ui';

<Textarea 
  label="Description" 
  id="description" 
  error={errors.description}
  value={formData.description}
  onChange={(e) => setFormData({...formData, description: e.target.value})}
/>
```

### 9. Checkbox Component
A form checkbox component with label and error handling.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | string | Yes | Checkbox label |
| id | string | Yes | Checkbox ID for accessibility |
| error | string | No | Error message to display |
| ...props | InputHTMLAttributes | No | All standard input attributes (type will be overridden to 'checkbox') |

#### Usage
```tsx
import { Checkbox } from '@/shared/components/ui';

<Checkbox 
  label="I agree to the terms and conditions" 
  id="terms" 
  error={errors.terms}
  checked={formData.terms}
  onChange={(e) => setFormData({...formData, terms: e.target.checked})}
/>
```

### 10. Radio Component
A form radio component with label and error handling.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | string | Yes | Radio label |
| id | string | Yes | Radio ID for accessibility |
| error | string | No | Error message to display |
| ...props | InputHTMLAttributes | No | All standard input attributes (type will be overridden to 'radio') |

#### Usage
```tsx
import { Radio } from '@/shared/components/ui';

<div>
  <Radio 
    label="Male" 
    id="male" 
    name="gender"
    error={errors.gender}
    checked={formData.gender === 'male'}
    onChange={(e) => setFormData({...formData, gender: 'male'})}
  />
  <Radio 
    label="Female" 
    id="female" 
    name="gender"
    error={errors.gender}
    checked={formData.gender === 'female'}
    onChange={(e) => setFormData({...formData, gender: 'female'})}
  />
</div>
```

### 11. FileInput Component
A form file input component with label and error handling.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| label | string | Yes | File input label |
| id | string | Yes | File input ID for accessibility |
| error | string | No | Error message to display |
| ...props | InputHTMLAttributes | No | All standard input attributes (type will be overridden to 'file') |

#### Usage
```tsx
import { FileInput } from '@/shared/components/ui';

<FileInput 
  label="Upload Resume" 
  id="resume" 
  error={errors.resume}
  onChange={(e) => setFormData({...formData, resume: e.target.files?.[0]})}
/>
```

### 12. Table Component
A responsive table component for displaying tabular data.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| headers | string[] | Yes | Table headers |
| children | ReactNode | Yes | Table rows (tbody content) |
| className | string | No | Additional CSS classes to apply |

#### Usage
```tsx
import { Table } from '@/shared/components/ui';

<Table headers={['Name', 'Email', 'Position', 'Department']}>
  {employees.map(employee => (
    <tr key={employee.id}>
      <td>{employee.name}</td>
      <td>{employee.email}</td>
      <td>{employee.position}</td>
      <td>{employee.department}</td>
    </tr>
  ))}
</Table>
```

### 13. Badge Component
A small badge component for displaying status or categorical information.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | Badge content |
| variant | 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'info' | No | Badge style variant (default: 'primary') |
| className | string | No | Additional CSS classes to apply |

#### Usage
```tsx
import { Badge } from '@/shared/components/ui';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Inactive</Badge>
```

### 14. Alert Component
A dismissible alert component for displaying important messages.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | Alert content |
| variant | 'info' \| 'success' \| 'warning' \| 'danger' | No | Alert style variant (default: 'info') |
| icon | ReactNode | No | Optional icon to display |
| onClose | () => void | No | Function to call when alert is dismissed |

#### Usage
```tsx
import { Alert } from '@/shared/components/ui';
import { Info } from 'lucide-react';

<Alert 
  variant="info" 
  icon={<Info />}
  onClose={() => setShowAlert(false)}
>
  This is an informational message
</Alert>
```

### 15. Toast Component
A toast notification component for displaying brief messages.

#### Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| id | number | Yes | Unique identifier for the toast |
| message | string | Yes | Toast message |
| type | 'info' \| 'success' \| 'error' | Yes | Toast type |

#### Usage
```tsx
import { Toast } from '@/shared/components/ui';

<Toast 
  id={1} 
  message="Operation completed successfully" 
  type="success" 
/>
```

## Accessibility Features

All components are designed with accessibility in mind:
- Proper ARIA attributes
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Responsive Design

All components are responsive and adapt to different screen sizes:
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly elements
- Adaptive typography

## Theming

Components support both light and dark themes:
- Automatic theme detection
- CSS variable-based theming
- Consistent color palette
- Easy customization

## Performance

Components are optimized for performance:
- Minimal re-renders
- Efficient DOM structure
- Lazy loading support
- Bundle size optimization

## Best Practices

### Component Usage
1. Always provide proper labels for form elements
2. Use appropriate heading hierarchy
3. Implement proper error handling
4. Follow accessibility guidelines
5. Maintain consistent styling

### Customization
1. Use className prop for additional styling
2. Extend components rather than modifying them
3. Follow established design patterns
4. Maintain consistency across the application

### Testing
1. Test components in isolation
2. Verify accessibility features
3. Check responsive behavior
4. Validate error states

## Extending Components

To extend existing components:
1. Use composition over inheritance
2. Leverage className prop for styling
3. Pass through additional props when needed
4. Maintain accessibility features

Example of extending a component:
```tsx
const CustomButton = ({ className, ...props }) => (
  <Button 
    className={`custom-button-class ${className}`} 
    {...props} 
  />
);
```

## Troubleshooting

### Common Issues
1. **Styling Conflicts**: Use className prop to override default styles
2. **Accessibility Warnings**: Ensure all required props are provided
3. **Type Errors**: Check that all props match the expected types
4. **Rendering Issues**: Verify component hierarchy and nesting

### Debugging Tips
1. Use browser dev tools to inspect component structure
2. Check console for error messages
3. Verify prop values with React DevTools
4. Test components in isolation

## Contributing

To contribute new components:
1. Follow the established patterns
2. Provide comprehensive documentation
3. Include TypeScript definitions
4. Add unit tests
5. Ensure accessibility compliance
6. Verify responsive behavior