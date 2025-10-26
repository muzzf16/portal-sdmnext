# DashboardLayout Component Improvements Documentation

## Overview

The DashboardLayout component serves as the main layout for the HRMS application, providing a consistent structure with a collapsible sidebar, navigation menu, and main content area. Recent improvements have enhanced its functionality, accessibility, and maintainability.

## Key Improvements

### 1. Enhanced Accessibility
- **Skip to Main Content**: Added a skip link for keyboard navigation
- **ARIA Attributes**: Implemented proper ARIA roles, labels, and states
- **Focus Management**: Improved keyboard navigation and focus handling
- **Semantic HTML**: Used appropriate HTML elements for better screen reader support

### 2. Improved Performance
- **Custom `useSidebar` Hook**: Created a dedicated hook for sidebar state management
- **Memoization**: Used `useMemo` and `useCallback` to prevent unnecessary re-renders
- **Lazy Loading**: Leveraged React Router's lazy loading capabilities
- **Efficient Rendering**: Optimized component rendering with conditional class names

### 3. Responsive Design
- **Collapsible Sidebar**: Sidebar automatically adapts to different screen sizes
- **Mobile Optimization**: Improved layout for mobile devices
- **Flexible Grid**: Used Tailwind's responsive grid system

### 4. Better Component Structure
- **Modular Architecture**: Separated concerns with custom hooks
- **Type Safety**: Added TypeScript interfaces for better type checking
- **Clean Code**: Improved code organization and readability

### 5. User Experience Enhancements
- **Smooth Transitions**: Added CSS transitions for sidebar collapse/expand
- **Visual Feedback**: Improved hover states and interactive elements
- **Confirmation Dialogs**: Added confirmation for destructive actions

## Component Structure

```
DashboardLayout
├── Sidebar
│   ├── Branding/Header
│   ├── Navigation Menu (with icons)
│   └── Logout Button
├── Main Content
│   ├── Header (with user profile)
│   └── Main Content Area (Outlet)
└── Custom Hooks
    └── useSidebar
```

## Custom Hooks

### useSidebar Hook
Manages the state and behavior of the sidebar:
- `isSidebarOpen`: Boolean indicating sidebar visibility
- `toggleSidebar`: Function to toggle sidebar state
- `closeSidebar`: Function to close sidebar
- `openSidebar`: Function to open sidebar
- Responsive behavior based on screen size

## Props

The DashboardLayout component doesn't accept any props.

## Usage

```tsx
import DashboardLayout from '@/app/layout/DashboardLayout';

const App = () => {
  return (
    <Router>
      <DashboardLayout />
    </Router>
  );
};
```

## Accessibility Features

### ARIA Implementation
- `role="main"` on main container
- `aria-label` for descriptive labels
- `aria-current="page"` for active navigation items
- `aria-expanded` for collapsible elements
- `aria-hidden="true"` for decorative icons

### Keyboard Navigation
- Skip link for bypassing repetitive content
- Focusable elements with proper tab order
- Keyboard-accessible interactive elements

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy (h1, h2, etc.)
- Descriptive labels for all interactive elements

## Responsive Behavior

### Desktop (> 768px)
- Sidebar expanded by default
- Full navigation menu visible
- User profile information displayed

### Mobile (< 768px)
- Sidebar collapsed by default
- Navigation icons only visible
- Compact header layout

## Performance Optimizations

### Memoization
- `useMemo` for navigation items and active item calculation
- `useCallback` for event handlers
- Prevents unnecessary re-renders

### Efficient State Management
- Custom `useSidebar` hook for sidebar state
- Context API for authentication state
- Minimal re-renders through proper state updates

## Styling

The component uses Tailwind CSS classes for styling with the following customizations:

### Colors
- Primary: `bg-primary-800`, `text-white`
- Secondary: `bg-neutral-100`, `dark:bg-neutral-900`
- Active States: `bg-primary-700`, `dark:bg-primary-600`

### Spacing
- Consistent padding and margins using Tailwind spacing scale
- Responsive padding (`p-4` on mobile, `p-8` on desktop)

### Transitions
- Smooth transitions for sidebar collapse/expand
- Hover effects for interactive elements
- Focus rings for accessibility

## Internationalization (i18n)

The component supports internationalization through react-i18next:
- Translatable text for all UI elements
- RTL language support
- Language-specific formatting

## Security

### Authentication
- Protected routes using AuthContext
- Secure logout with confirmation
- Session management

### Input Validation
- Client-side validation for user inputs
- Sanitization of displayed content

## Testing

### Unit Tests
- Component rendering tests
- State management tests
- Event handler tests
- Accessibility tests

### Integration Tests
- Navigation flow tests
- Authentication flow tests
- Responsive behavior tests

## Customization

### Theme Variables
To customize the theme, update the Tailwind configuration:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'primary-800': '#1e3a8a',
      'primary-700': '#2563eb',
      'primary-600': '#3b82f6',
    }
  }
}
```

### Navigation Items
To add/remove navigation items, update the `navItems` array in the component:

```tsx
const navItems = useMemo<NavItem[]>(() => [
  { to: "/dashboard/admin", text: t('dashboard.title'), icon: Home },
  // Add new items here
], [t]);
```

## Troubleshooting

### Sidebar Not Collapsing on Mobile
Ensure the window resize event is properly handled. The `useSidebar` hook automatically handles this.

### Active Navigation Item Not Highlighting
Check that the `to` prop in navigation items matches the current route path.

### Translation Keys Missing
Verify that all translation keys exist in the i18n resources files.

## Dependencies

- React (^18.0.0)
- React Router DOM (^6.0.0)
- Tailwind CSS (^3.0.0)
- Lucide React (^0.100.0)
- clsx (^2.0.0)
- react-i18next (^11.0.0)

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.