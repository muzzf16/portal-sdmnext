# Laporan & Analitik Module Documentation

## Overview

The Laporan & Analitik module provides comprehensive reporting and analytics capabilities for the HRMS system. It includes pre-built reports, customizable report builder, and data export functionality.

## Features

### 1. Pre-built Reports
- **Employee Reports** - Detailed employee information and statistics
- **Attendance Reports** - Attendance tracking and analytics
- **Payroll Reports** - Salary and compensation data
- **Leave Reports** - Leave request tracking and management
- **Performance Reports** - Employee performance evaluations
- **Turnover Reports** - Employee turnover analysis
- **Demographic Reports** - Employee demographics and distribution

### 2. Advanced Analytics
- **Comprehensive Employee Analytics** - Detailed employee data with related metrics
- **Attendance Analytics** - Punctuality statistics and trends
- **Payroll Analytics** - Compensation trends and comparisons

### 3. Custom Report Builder
- **Flexible Field Selection** - Choose specific fields for custom reports
- **Advanced Filtering** - Apply multiple filters based on data criteria
- **Dynamic Report Generation** - Generate reports on-demand with custom parameters

### 4. Export Functionality
- **Excel Export** - Export reports to Excel format
- **PDF Export** - Export reports to PDF format (planned)
- **CSV Export** - Export reports to CSV format (planned)

## API Endpoints

### Standard Reports
- `GET /api/reports/employees` - Get employee report
- `GET /api/reports/attendance` - Get attendance report
- `GET /api/reports/payroll` - Get payroll report
- `GET /api/reports/leave` - Get leave report
- `GET /api/reports/performance` - Get performance report
- `GET /api/reports/turnover` - Get turnover report
- `GET /api/reports/demographics` - Get demographic report

### Enhanced Analytics
- `GET /api/reports/employees/comprehensive` - Get comprehensive employee report
- `GET /api/reports/attendance/analytics` - Get attendance analytics
- `GET /api/reports/payroll/analytics` - Get payroll analytics

### Export Endpoints
- `GET /api/reports/employees/export` - Export employee report
- `GET /api/reports/attendance/export` - Export attendance report
- `GET /api/reports/payroll/export` - Export payroll report
- `GET /api/reports/leave/export` - Export leave report
- `GET /api/reports/performance/export` - Export performance report

### Custom Report Builder
- `GET /api/reports/custom/metadata` - Get report builder metadata
- `POST /api/reports/custom/generate` - Generate custom report
- `POST /api/reports/custom/export` - Export custom report

## Usage Examples

### Generate Employee Report
```bash
curl -X GET "http://localhost:3333/api/reports/employees" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Export Attendance Report
```bash
curl -X GET "http://localhost:3333/api/reports/attendance/export?startDate=2023-01-01&endDate=2023-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Generate Custom Report
```bash
curl -X POST "http://localhost:3333/api/reports/custom/generate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "pegawai",
    "fields": ["name", "position", "department", "joinDate"],
    "filters": {
      "department": "IT",
      "isActive": true
    }
  }'
```

## Implementation Details

### Report Generation Process
1. Data is retrieved from respective module repositories
2. Data is processed and formatted according to report requirements
3. Analytics calculations are performed when needed
4. Results are returned in standardized JSON format

### Export Process
1. Reports are generated in standard format
2. Data is formatted for export (column headers, data types)
3. Export metadata is included in response
4. Frontend can use this data to generate actual export files

### Custom Report Builder
1. Metadata service provides available fields and filters
2. User selects fields and applies filters
3. Custom report service generates report based on selections
4. Results can be exported in multiple formats

## Future Enhancements

1. **PDF Export** - Add PDF generation capability
2. **CSV Export** - Add CSV export functionality
3. **Scheduled Reports** - Allow users to schedule automatic report generation
4. **Report Templates** - Save commonly used report configurations
5. **Data Visualization** - Add charting capabilities for reports
6. **Dashboard Widgets** - Create report widgets for dashboards

## Error Handling

All endpoints follow standard error handling patterns:
- 400 Bad Request - Invalid parameters or missing required fields
- 401 Unauthorized - Missing or invalid authentication token
- 403 Forbidden - Insufficient permissions
- 500 Internal Server Error - Unexpected server errors

Error responses include:
```json
{
  "success": false,
  "message": "Error description"
}
```