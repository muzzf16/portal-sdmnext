# Dashboard Module Documentation

## Overview

The Dashboard module provides real-time analytics and insights for both administrators and employees. It aggregates data from all HR modules to provide a comprehensive view of organizational health and individual performance.

## Features

### 1. Admin Dashboard
- **Employee Statistics** - Total, active, and inactive employee counts
- **Attendance Overview** - Today's attendance and absence rates
- **Leave Management** - Pending and approved leave requests
- **Payroll Summary** - Monthly payroll processing status
- **Performance Metrics** - Completed performance reviews
- **Contract Status** - Active and expiring contracts
- **Demographic Analysis** - Gender and education distribution

### 2. Employee Dashboard
- **Personal Attendance Summary** - Individual attendance rates
- **Leave Request Status** - Personal leave request history
- **Payroll Information** - Latest salary and deduction details
- **Performance Reviews** - Recent performance evaluation results
- **Upcoming Events** - Important dates and deadlines

### 3. Real-Time Data
- **Live Updates** - Real-time data refresh
- **Historical Trends** - Historical data comparison
- **KPI Tracking** - Key performance indicator monitoring

## API Endpoints

### Dashboard Data
- `GET /api/dashboard/admin` - Get admin dashboard data
- `GET /api/dashboard/employee/:employeeId` - Get employee dashboard data

## Usage Examples

### Get Admin Dashboard Data
```bash
curl -X GET "http://localhost:3333/api/dashboard/admin" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Employee Dashboard Data
```bash
curl -X GET "http://localhost:3333/api/dashboard/employee/emp-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Implementation Details

### Data Aggregation Process
The dashboard aggregates data from multiple sources:

1. **Employee Data** - Retrieved from pegawai repository
2. **Attendance Data** - Retrieved from absensi repository
3. **Leave Data** - Retrieved from cuti repository
4. **Payroll Data** - Retrieved from penggajian repository
5. **Performance Data** - Retrieved from kinerja repository
6. **Contract Data** - Retrieved from kontrak repository

### Admin Dashboard Components
1. **Employee Statistics Widget**
   - Total employees count
   - Active/inactive distribution
   - Department distribution

2. **Attendance Widget**
   - Today's attendance count
   - Absence tracking
   - Punctuality rates

3. **Leave Management Widget**
   - Pending leave requests
   - Approved leave count
   - Leave utilization rates

4. **Payroll Widget**
   - Monthly payroll status
   - Processed payroll count
   - Average salary metrics

5. **Performance Widget**
   - Completed reviews count
   - Average performance scores
   - Review completion rates

6. **Contract Widget**
   - Active contracts count
   - Expiring contracts alerts
   - Contract renewal tracking

7. **Demographics Widget**
   - Gender distribution
   - Education level distribution
   - Age group distribution

### Employee Dashboard Components
1. **Personal Attendance Summary**
   - Attendance percentage
   - Late arrival frequency
   - Leave day usage

2. **Leave Request Status**
   - Recent leave requests
   - Approval status tracking
   - Remaining leave balance

3. **Payroll Information**
   - Latest payroll details
   - Salary components breakdown
   - Deduction summary

4. **Performance Reviews**
   - Most recent evaluation
   - Performance trend analysis
   - Goal tracking

### Data Processing
1. **Real-Time Calculations** - Instant metrics computation
2. **Historical Analysis** - Trend identification and comparison
3. **Data Normalization** - Consistent data formatting across sources
4. **Performance Optimization** - Efficient database queries and caching

## Future Enhancements

1. **Customizable Widgets** - Allow users to customize dashboard layout
2. **Advanced Analytics** - Predictive analytics and forecasting
3. **Data Visualization** - Interactive charts and graphs
4. **Export Capabilities** - Dashboard data export functionality
5. **Mobile Optimization** - Responsive design for mobile devices
6. **Role-Based Dashboards** - Different dashboard views for different roles
7. **Integration with External Systems** - Connect with third-party HR systems
8. **Automated Reporting** - Scheduled dashboard report generation

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

## Security Considerations

1. **Authentication Required** - All endpoints require valid authentication
2. **Authorization Checks** - Users can only access authorized dashboard data
3. **Data Privacy** - Sensitive information is protected and anonymized when necessary
4. **Audit Logging** - Dashboard access is logged for audit purposes
5. **Rate Limiting** - API rate limiting prevents abuse