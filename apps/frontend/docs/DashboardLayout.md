# Dashboard Layout Component Documentation

## Overview

The DashboardLayout component provides a responsive, accessible, and feature-rich layout for the HRMS application. It includes a collapsible sidebar, navigation menu, user profile section, and main content area.

## Features

### 1. Responsive Design
- Collapsible sidebar that adapts to different screen sizes
- Mobile-friendly layout with automatic sidebar collapse on small screens
- Flexible grid system using Tailwind CSS

### 2. Accessibility
- Proper ARIA attributes for screen readers
- Keyboard navigation support
- Skip to main content link
- Focus management
- Semantic HTML structure

### 3. Navigation
- Dynamic navigation menu with active state highlighting
- Icon-based menu items
- Collapsible/expandable sidebar

### 4. User Management
- User profile display
- Logout functionality with confirmation
- Session management

### 5. Performance
- Memoized components to prevent unnecessary re-renders
- Efficient state management with custom hooks
- Lazy loading of components

## Component Structure

```
DashboardLayout
├── Sidebar
│   ├── Branding/Header
│   ├── Navigation Menu
│   └── Logout Button
└── Main Content
    ├── Header
    │   ├── Sidebar Toggle
    │   ├── Page Title
    │   └── User Profile
    └── Main Content Area
        └── Outlet (React Router)
```

## Custom Hooks

### useSidebar Hook
Manages the state and behavior of the sidebar:
- `isSidebarOpen`: Boolean state indicating if sidebar is open
- `toggleSidebar`: Function to toggle sidebar state
- `closeSidebar`: Function to close sidebar
- `openSidebar`: Function to open sidebar
- Automatically adapts to screen size changes

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

### 1. ARIA Attributes
- `aria-label` for descriptive labels
- `aria-current` for active navigation items
- `aria-expanded` for collapsible elements
- `aria-hidden` for decorative elements

### 2. Keyboard Navigation
- Full keyboard support for all interactive elements
- Focus management for modal dialogs
- Skip to main content link for screen readers

### 3. Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- Descriptive labels for all interactive elements

## Responsive Behavior

### Desktop (> 768px)
- Sidebar is expanded by default
- Full navigation menu visible
- User profile information displayed

### Mobile (< 768px)
- Sidebar is collapsed by default
- Navigation icons only visible
- Compact header layout

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

## Performance Optimizations

### 1. Memoization
- `useMemo` for navigation items and active item calculation
- `useCallback` for event handlers
- Prevents unnecessary re-renders

### 2. Lazy Loading
- Components loaded on-demand
- Code splitting for better initial load times

### 3. Efficient State Management
- Custom `useSidebar` hook for sidebar state
- Context API for authentication state
- Minimal re-renders through proper state updates

## Internationalization (i18n)

The component supports internationalization through react-i18next:
- Translatable text for all UI elements
- RTL language support
- Language-specific formatting

## Security

### 1. Authentication
- Protected routes using AuthContext
- Secure logout with confirmation
- Session management

### 2. Input Validation
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