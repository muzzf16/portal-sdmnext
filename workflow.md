✦ PORTALS-SDM HRMS System Workflow Documentation

  Overview
  PORTALS-SDM (Sistem Manajemen Sumber Daya Manusia) is a comprehensive HR management system with 10 core
  modules that work together to manage all aspects of human resource operations. Each module has specific
  workflows that integrate seamlessly with others to provide a unified HR experience.

  Module Workflows

  1. Master Data Pegawai (Employee Management)
  Purpose: Central repository for all employee information

  Workflow:
   1. Employee Creation:
      - HR creates new employee profile with basic information (name, NIP, email)
      - System generates unique employee ID
      - Default values assigned (leave balance: 18 days, status: active)
      - Profile photo can be uploaded

   2. Employee Updates:
      - Personal information updates (contact details, address)
      - Professional information updates (position, department, promotion)
      - Status changes (active/inactive)
      - Salary and payroll information updates

   3. Employee Termination:
      - Mark employee as inactive
      - Record termination date
      - Archive employee data
      - Transfer associated records to archived status

  Integration Points:
   - All other modules reference employee data
   - Payroll uses salary information
   - Attendance tracks employee presence
   - Leave management uses employee leave balance

  2. Absensi & Kehadiran (Attendance Management)
  Purpose: Track employee daily attendance and working hours

  Workflow:
   1. Clock In:
      - Employee clicks "Clock In" button
      - System records timestamp and employee ID
      - Validates against work schedule
      - Marks status as "hadir" (present)

   2. Clock Out:
      - Employee clicks "Clock Out" button
      - System records timestamp
      - Calculates work duration
      - Updates attendance record

   3. Manual Entry (HR):
      - HR can manually add attendance records
      - For special cases (remote work, business trips)
      - Can adjust status (izin, sakit, cuti, alpa)

   4. Reporting:
      - Generate daily attendance reports
      - Calculate punctuality statistics
      - Identify attendance patterns

  Integration Points:
   - Links to employee profiles
   - Feeds into payroll calculations
   - Used for leave balance adjustments
   - Provides data for performance reviews

  3. Cuti & Izin (Leave Management)
  Purpose: Manage employee leave requests and approvals

  Workflow:
   1. Leave Request Submission:
      - Employee submits leave request with:
        - Leave type (annual, sick, maternity, personal)
        - Start and end dates
        - Reason for leave
        - Supporting documents (optional)
      - System validates leave balance
      - Request status set to "menunggu" (waiting)

   2. Approval Process:
      - HR/Admin reviews request
      - Can approve or reject with reason
      - System updates leave balance if approved
      - Notifies employee of decision

   3. Leave Tracking:
      - Monitor remaining leave balances
      - View leave history
      - Generate leave utilization reports

  Integration Points:
   - Uses employee data for leave balance
   - Integrates with attendance (marks as "cuti")
   - Affects payroll calculations
   - Feeds into performance reviews

  4. Penggajian (Payroll Management)
  Purpose: Process monthly employee salaries and compensation

  Workflow:
   1. Payroll Setup:
      - Define salary components:
        - Base salary (gaji pokok)
        - Allowances (tunjangan)
        - Deductions (potongan)
      - Set up recurring components

   2. Monthly Processing:
      - HR initiates payroll run for specific period
      - System calculates:
        - Total income (base + allowances)
        - Total deductions
        - Net salary
      - Applies attendance-based deductions
      - Applies leave-based adjustments

   3. Payslip Generation:
      - Generates individual payslips
      - Stores payroll records
      - Notifies employees of availability

  Integration Points:
   - Uses employee salary information
   - Incorporates attendance data for deductions
   - Considers leave usage for salary adjustments
   - Links to bank payment systems (conceptual)

  5. Penilaian Kinerja (Performance Review)
  Purpose: Evaluate employee performance and set improvement goals

  Workflow:
   1. Review Setup:
      - Define review period
      - Assign reviewers (typically supervisors/HR)
      - Set KPI targets

   2. Evaluation Process:
      - Reviewer assesses employee performance
      - Scores assigned to KPIs
      - Overall performance calculated
      - Strengths and improvement areas documented

   3. Feedback Collection:
      - Employee provides feedback on review
      - Discussion between employee and reviewer
      - Action plans created

   4. Review Completion:
      - Finalize review status
      - Store in employee record
      - Generate performance reports

  Integration Points:
   - Links to employee profiles
   - Uses attendance and leave data for context
   - Influences salary adjustments
   - Guides training recommendations

  6. Pelatihan (Training Management)
  Purpose: Track employee training and professional development

  Workflow:
   1. Training Program Setup:
      - Define training programs
      - Set schedules and venues
      - Assign trainers/organizers

   2. Employee Enrollment:
      - Enroll employees in training
      - Track attendance
      - Collect feedback

   3. Certificate Management:
      - Record training completion
      - Store certificates digitally
      - Update employee training history

   4. Skill Development Tracking:
      - Monitor skill progression
      - Identify skill gaps
      - Plan future training

  Integration Points:
   - Links to employee profiles
   - Feeds into performance reviews
   - Influences career development plans
   - Supports recruitment decisions

  7. Manajemen Kontrak & Jabatan (Contract & Position Management)
  Purpose: Manage employment contracts and organizational hierarchy

  Workflow:
   1. Contract Creation:
      - Define contract terms (type, duration, salary)
      - Set start and end dates
      - Upload contract documents
      - Assign to employee

   2. Contract Lifecycle Management:
      - Monitor contract expiration
      - Send automated reminders (30, 14, 7 days before)
      - Process renewals or terminations
      - Update contract statuses

   3. Position Management:
      - Define organizational structure
      - Track position changes (promotions, transfers)
      - Maintain job history records

  Integration Points:
   - Links to employee profiles
   - Triggers automated notifications
   - Affects payroll processing
   - Influences recruitment needs

  8. Rekrutmen & Onboarding (Recruitment & Onboarding)
  Purpose: Manage candidate applications and new employee integration

  Workflow:
   1. Job Posting:
      - Create job openings
      - Define requirements and qualifications
      - Publish to job boards (conceptual)

   2. Application Processing:
      - Receive candidate applications
      - Review resumes and qualifications
      - Schedule interviews
      - Track application status

   3. Selection Process:
      - Conduct interviews
      - Evaluate candidates
      - Make hiring decisions
      - Send offer letters

   4. Onboarding Process:
      - Create new employee profile
      - Assign onboarding tasks
      - Track completion
      - Facilitate smooth transition

  Integration Points:
   - Creates new employee records
   - Links to contract management
   - Initiates payroll setup
   - Starts training programs

  9. Laporan & Analitik (Reports & Analytics)
  Purpose: Generate comprehensive reports and business intelligence

  Workflow:
   1. Standard Reports:
      - Employee directory
      - Attendance summaries
      - Leave utilization reports
      - Payroll reports
      - Performance reviews
      - Training completion reports

   2. Analytics Dashboard:
      - Real-time KPI monitoring
      - Trend analysis
      - Comparative reporting
      - Predictive analytics

   3. Custom Reports:
      - Select specific fields
      - Apply filters
      - Generate on-demand reports
      - Export to various formats

   4. Data Export:
      - Export to Excel/PDF/CSV
      - Scheduled report generation
      - Automated distribution

  Integration Points:
   - Aggregates data from all modules
   - Provides insights for decision-making
   - Supports compliance reporting
   - Enables strategic planning

  10. Notifikasi & Pengingat Otomatis (Notifications & Automated Reminders)
  Purpose: Keep users informed of important events and deadlines

  Workflow:
   1. Event Detection:
      - System monitors for trigger events
      - Contract expirations
      - Leave approvals
      - Payroll releases
      - Performance review dates

   2. Notification Generation:
      - Create appropriate messages
      - Determine recipients
      - Set delivery channels (in-app, email, SMS - conceptual)

   3. Delivery Management:
      - Send notifications immediately or scheduled
      - Track read status
      - Handle delivery failures

   4. User Interaction:
      - View notifications in inbox
      - Mark as read
      - Take action on actionable notifications

  Integration Points:
   - Connects to all modules for event detection
   - Provides real-time user feedback
   - Enhances user experience
   - Reduces manual follow-ups

  Cross-Module Integration Workflow

  Employee Lifecycle
   1. Recruitment → Creates employee profile
   2. Onboarding → Sets up initial systems access
   3. Contract Management → Establishes employment terms
   4. Attendance → Tracks daily presence
   5. Leave Management → Manages time off
   6. Payroll → Processes monthly compensation
   7. Performance Review → Evaluates work quality
   8. Training → Develops skills
   9. Reports → Provides analytics
   10. Notifications → Keeps everyone informed

  Monthly HR Operations Cycle
   1. Attendance Review → Compile monthly attendance data
   2. Leave Processing → Approve/reject leave requests
   3. Payroll Preparation → Calculate salaries based on attendance
   4. Performance Monitoring → Track ongoing performance metrics
   5. Reporting → Generate monthly HR reports
   6. Notifications → Send payroll and other monthly alerts

  Year-End Processes
   1. Performance Reviews → Annual performance evaluations
   2. Contract Renewals → Review expiring contracts
   3. Leave Balance Reset → Update annual leave balances
   4. Training Planning → Plan next year's development programs
   5. Annual Reporting → Generate comprehensive yearly reports
   6. Budget Planning → Use analytics for next year's budget

  Automated Workflows

  1. Contract Expiration Reminders
   - Daily Check: System scans contracts expiring in 30, 14, and 7 days
   - Notification: Sends alerts to HR and employees
   - Action: Facilitates contract renewal discussions

  2. Payroll Release Notifications
   - Monthly Trigger: When payroll is processed
   - Notification: Alerts all employees
   - Action: Employees check payslips

  3. Leave Approval Notifications
   - Event Trigger: When leave requests are processed
   - Notification: Informs employees of approval status
   - Action: Employees adjust plans accordingly

  4. Performance Review Reminders
   - Scheduled Check: Before upcoming review dates
   - Notification: Alerts reviewers and employees
   - Action: Prepares for performance discussions

  5. Birthday Reminders
   - Daily Check: Identifies employees with birthdays
   - Notification: Alerts team members
   - Action: Team celebrates colleague's birthday

  This comprehensive workflow ensures seamless operation of all HR functions while maintaining data
  consistency and providing valuable insights for strategic decision-making.