import React from 'react';

interface MonthPickerProps {
    value: string; // Format: YYYY-MM
    onChange: (value: string) => void;
    label?: string;
    className?: string;
}

const MonthPicker: React.FC<MonthPickerProps> = ({ value, onChange, label, className }) => {
    return (
        <div className={className}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <input
                type="month"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
        </div>
    );
};

export default MonthPicker;
