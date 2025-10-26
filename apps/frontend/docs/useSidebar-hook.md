# useSidebar Hook Documentation

## Overview

The `useSidebar` hook is a custom React hook that manages the state and behavior of the application sidebar. It provides functionality for toggling, opening, and closing the sidebar, as well as automatically adapting to different screen sizes.

## Installation

The hook is automatically available as part of the application. No additional installation is required.

## Usage

```tsx
import { useSidebar } from '@/app/hooks/useSidebar';

const MyComponent = () => {
  const { isSidebarOpen, toggleSidebar, closeSidebar, openSidebar } = useSidebar();

  return (
    <div>
      <button onClick={toggleSidebar}>
        {isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
      </button>
      
      {isSidebarOpen && (
        <div>
          {/* Sidebar content */}
        </div>
      )}
    </div>
  );
};
```

## API

### Returns

The hook returns an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `isSidebarOpen` | `boolean` | Current state of the sidebar (open or closed) |
| `toggleSidebar` | `() => void` | Function to toggle the sidebar state |
| `closeSidebar` | `() => void` | Function to close the sidebar |
| `openSidebar` | `() => void` | Function to open the sidebar |

## Features

### 1. Responsive Behavior
- Automatically closes sidebar on mobile devices (screen width < 768px)
- Automatically opens sidebar on desktop devices (screen width >= 768px)
- Adapts to window resize events

### 2. State Management
- Maintains sidebar state across component re-renders
- Provides controlled methods for managing sidebar visibility

### 3. Performance Optimizations
- Uses `useCallback` to prevent unnecessary function recreations
- Implements efficient state updates

## Implementation Details

The hook uses React's built-in hooks:
- `useState` for managing the sidebar state
- `useCallback` for memoizing functions
- `useEffect` for handling side effects (window resize events)

### Resize Handling
The hook listens to window resize events and automatically:
1. Closes the sidebar when the screen becomes smaller than the mobile breakpoint (768px)
2. Opens the sidebar when the screen becomes larger than the mobile breakpoint

### Memory Management
The hook properly cleans up event listeners to prevent memory leaks:
- Removes resize event listener when the component unmounts

## Testing

The hook includes comprehensive unit tests covering:
- Initial state
- Toggle functionality
- Open/close functionality
- Responsive behavior
- Memory cleanup

## Best Practices

1. **Use destructuring** to access only the properties you need:
   ```tsx
   const { isSidebarOpen, toggleSidebar } = useSidebar();
   ```

2. **Combine with CSS transitions** for smooth animations:
   ```tsx
   <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
   ```

3. **Provide accessible labels** for screen readers:
   ```tsx
   <button 
     onClick={toggleSidebar}
     aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
     aria-expanded={isSidebarOpen}
   >
   ```

## Customization

To customize the mobile breakpoint, modify the value in the hook:
```tsx
// In useSidebar.ts
if (window.innerWidth < YOUR_CUSTOM_BREAKPOINT) {
  setIsSidebarOpen(false);
} else {
  setIsSidebarOpen(true);
}
```

## Troubleshooting

### Sidebar not closing on mobile
Ensure the window resize event is being triggered properly. You can manually dispatch the event:
```tsx
window.dispatchEvent(new Event('resize'));
```

### State not persisting
Make sure you're using the hook correctly and not calling it conditionally. Hooks must be called at the top level of a component.