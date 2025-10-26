// src/shared/components/ui/__tests__/uiComponents.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, StatCard, PageTitle, Button, Modal, Input, Select, Textarea, Checkbox, Radio, FileInput, Table, Badge, Alert, Toast } from '../index';
import { Users, Calendar, Edit3, Trash2, Plus, Search } from 'lucide-react';

describe('UI Components', () => {
  describe('Card Component', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <div>Test Content</div>
        </Card>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies additional className correctly', () => {
      render(
        <Card className="custom-class">
          <div>Test Content</div>
        </Card>
      );
      
      const card = screen.getByText('Test Content').closest('div');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('StatCard Component', () => {
    it('renders title, value, and icon correctly', () => {
      render(
        <StatCard 
          title="Total Employees" 
          value={125} 
          icon={<Users />} 
          color="bg-blue-100" 
        />
      );
      
      expect(screen.getByText('Total Employees')).toBeInTheDocument();
      expect(screen.getByText('125')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });
  });

  describe('PageTitle Component', () => {
    it('renders title correctly', () => {
      render(<PageTitle title="Dashboard" />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <PageTitle title="Dashboard">
          <button>Add New</button>
        </PageTitle>
      );
      
      expect(screen.getByText('Add New')).toBeInTheDocument();
    });
  });

  describe('Button Component', () => {
    it('renders children correctly', () => {
      render(<Button>Click Me</Button>);
      
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
      render(<Button variant="primary">Primary Button</Button>);
      
      const button = screen.getByText('Primary Button');
      expect(button).toHaveClass('bg-primary-dark');
    });

    it('shows loading spinner when loading', () => {
      render(<Button loading>Click Me</Button>);
      
      expect(screen.getByText('Memuat...')).toBeInTheDocument();
    });
  });

  describe('Modal Component', () => {
    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={jest.fn()} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      );
      
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('renders when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    it('renders label correctly', () => {
      render(<Input label="Name" id="name" />);
      
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    it('displays error message when provided', () => {
      render(<Input label="Name" id="name" error="Name is required" />);
      
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  describe('Select Component', () => {
    const options = [
      { value: 'it', label: 'IT' },
      { value: 'hr', label: 'Human Resources' },
      { value: 'finance', label: 'Finance' }
    ];

    it('renders label correctly', () => {
      render(<Select label="Department" id="department" options={options} />);
      
      expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('displays error message when provided', () => {
      render(
        <Select 
          label="Department" 
          id="department" 
          options={options} 
          error="Department is required" 
        />
      );
      
      expect(screen.getByText('Department is required')).toBeInTheDocument();
    });

    it('renders options correctly', () => {
      render(<Select label="Department" id="department" options={options} />);
      
      const select = screen.getByLabelText('Department') as HTMLSelectElement;
      expect(select.options).toHaveLength(options.length + 1); // +1 for default empty option
    });
  });

  describe('Textarea Component', () => {
    it('renders label correctly', () => {
      render(<Textarea label="Description" id="description" />);
      
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('displays error message when provided', () => {
      render(<Textarea label="Description" id="description" error="Description is required" />);
      
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  describe('Checkbox Component', () => {
    it('renders label correctly', () => {
      render(<Checkbox label="Accept Terms" id="accept-terms" />);
      
      expect(screen.getByLabelText('Accept Terms')).toBeInTheDocument();
    });

    it('displays error message when provided', () => {
      render(<Checkbox label="Accept Terms" id="accept-terms" error="You must accept terms" />);
      
      expect(screen.getByText('You must accept terms')).toBeInTheDocument();
    });
  });

  describe('Radio Component', () => {
    it('renders label correctly', () => {
      render(<Radio label="Option 1" id="option-1" name="options" />);
      
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    });

    it('displays error message when provided', () => {
      render(<Radio label="Option 1" id="option-1" name="options" error="Selection is required" />);
      
      expect(screen.getByText('Selection is required')).toBeInTheDocument();
    });
  });

  describe('FileInput Component', () => {
    it('renders label correctly', () => {
      render(<FileInput label="Upload Resume" id="resume" />);
      
      expect(screen.getByText('Upload Resume')).toBeInTheDocument();
    });

    it('displays error message when provided', () => {
      render(<FileInput label="Upload Resume" id="resume" error="Resume is required" />);
      
      expect(screen.getByText('Resume is required')).toBeInTheDocument();
    });
  });

  describe('Table Component', () => {
    const headers = ['Name', 'Email', 'Position'];

    it('renders headers correctly', () => {
      render(
        <Table headers={headers}>
          <tr>
            <td>John Doe</td>
            <td>john@example.com</td>
            <td>Developer</td>
          </tr>
        </Table>
      );
      
      headers.forEach(header => {
        expect(screen.getByText(header)).toBeInTheDocument();
      });
    });
  });

  describe('Badge Component', () => {
    it('renders children correctly', () => {
      render(<Badge>Active</Badge>);
      
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
      render(<Badge variant="success">Active</Badge>);
      
      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('bg-green-100');
    });
  });

  describe('Alert Component', () => {
    it('renders children correctly', () => {
      render(<Alert>Alert Message</Alert>);
      
      expect(screen.getByText('Alert Message')).toBeInTheDocument();
    });

    it('applies variant classes correctly', () => {
      render(<Alert variant="success">Success Message</Alert>);
      
      const alert = screen.getByText('Success Message').closest('div');
      expect(alert).toHaveClass('bg-green-50');
    });
  });

  describe('Toast Component', () => {
    it('renders message correctly', () => {
      render(
        <Toast 
          id={1} 
          message="Operation completed successfully" 
          type="success" 
        />
      );
      
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });
  });
});