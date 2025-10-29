# Notifikasi & Pengingat Otomatis Module Documentation

## Overview

The Notifikasi & Pengingat Otomatis module provides a comprehensive notification system with automated reminders for important HR events. It supports multiple delivery channels and scheduled notifications.

## Features

### 1. Notification Management
- **In-App Notifications** - Real-time notifications within the application
- **Email Notifications** - Email delivery (planned)
- **SMS Notifications** - SMS delivery (planned)
- **Push Notifications** - Mobile push notifications (planned)

### 2. Automated Reminders
- **Contract Expiration Reminders** - 30, 14, and 7 days before contract expiration
- **Leave Approval Notifications** - Automatic notifications when leave requests are processed
- **Payroll Release Notifications** - Notifications when payroll is processed
- **Performance Review Reminders** - Upcoming performance evaluation notifications
- **Birthday Reminders** - Team member birthday notifications

### 3. Notification Types
- **Information** - General information notifications
- **Warning** - Warning notifications for important events
- **Success** - Success confirmation notifications
- **Error** - Error or failure notifications

### 4. Scheduled Notifications
- **Future-Dated Notifications** - Schedule notifications for future delivery
- **Recurring Notifications** - Set up recurring notification patterns
- **Conditional Notifications** - Trigger notifications based on specific conditions

## API Endpoints

### Standard Notifications
- `GET /api/notifikasi/employee/:employeeId` - Get notifications for employee
- `GET /api/notifikasi/employee/:employeeId/unread` - Get unread notifications for employee
- `POST /api/notifikasi/employee/:employeeId` - Create new notification
- `PUT /api/notifikasi/:notificationId/read` - Mark notification as read
- `GET /api/notifikasi/scheduled` - Get scheduled notifications

### Automated Reminders
- `POST /api/notifikasi/automated/contracts/expiring` - Send contract expiration reminders
- `POST /api/notifikasi/automated/leave/approvals` - Send leave approval notifications
- `POST /api/notifikasi/automated/payroll/releases` - Send payroll release notifications
- `POST /api/notifikasi/automated/performance/reviews` - Send performance review reminders
- `POST /api/notifikasi/automated/birthdays` - Send birthday reminders
- `POST /api/notifikasi/automated/all` - Send all automated reminders

## Usage Examples

### Get Employee Notifications
```bash
curl -X GET "http://localhost:3333/api/notifikasi/employee/emp-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create New Notification
```bash
curl -X POST "http://localhost:3333/api/notifikasi/employee/emp-123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Your leave request has been approved",
    "type": "success",
    "delivery_channel": "in_app",
    "related_entity": "leave",
    "related_entity_id": "leave-456"
  }'
```

### Mark Notification as Read
```bash
curl -X PUT "http://localhost:3333/api/notifikasi/notif-789/read" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Send Contract Expiration Reminders
```bash
curl -X POST "http://localhost:3333/api/notifikasi/automated/contracts/expiring" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Implementation Details

### Automated Reminder System
The automated reminder system runs on a scheduled basis using the job scheduler:

1. **Daily Checks** - Runs daily to check for upcoming events
2. **Contract Expirations** - Checks contracts expiring in 30, 14, and 7 days
3. **Leave Processing** - Sends notifications for recently processed leave requests
4. **Payroll Releases** - Notifies employees when payroll is processed
5. **Performance Reviews** - Sends reminders for upcoming performance evaluations
6. **Birthdays** - Sends birthday reminders to team members

### Notification Delivery
1. Notifications are stored in the database with delivery status
2. Delivery channels determine how notifications are sent
3. Scheduled notifications are delivered at their specified time
4. Failed deliveries are retried based on system configuration

### Scheduler Implementation
The scheduler runs various jobs at predetermined intervals:
- **Contract Expiration Reminders** - Daily at 9:00 AM
- **Leave Approval Notifications** - Hourly
- **Payroll Release Notifications** - Daily at 10:00 AM
- **Performance Review Reminders** - Daily at 11:00 AM
- **Birthday Reminders** - Daily at 8:00 AM
- **All Automated Reminders** - Daily at midnight

## Future Enhancements

1. **Email Integration** - Add email notification delivery
2. **SMS Integration** - Add SMS notification delivery
3. **Push Notifications** - Add mobile push notification support
4. **Notification Preferences** - Allow users to configure notification preferences
5. **Advanced Scheduling** - More complex scheduling options for notifications
6. **Notification Templates** - Predefined templates for common notifications
7. **Multi-Language Support** - Support for notifications in multiple languages
8. **Notification Analytics** - Track notification delivery and engagement rates

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
2. **Authorization Checks** - Users can only access their own notifications
3. **Data Encryption** - Notification content is stored securely
4. **Audit Logging** - Notification activities are logged for audit purposes
5. **Rate Limiting** - API rate limiting prevents abuse