import sqlite3

c_host = sqlite3.connect('temp_copy.sqlite')
c_docker = sqlite3.connect('temp_copy_docker.sqlite')

users_host = {email: (name, role, emp_id) for id_, name, email, role, emp_id in c_host.execute('SELECT id, name, email, role, employeeId FROM pengguna').fetchall()}
users_docker = {email: (name, role, emp_id) for id_, name, email, role, emp_id in c_docker.execute('SELECT id, name, email, role, employeeId FROM pengguna').fetchall()}

print('=== Users in Host but NOT in Docker ===')
for email in users_host:
    if email not in users_docker:
        print(f'  * {email}: {users_host[email]}')

print('\n=== Users in Docker but NOT in Host ===')
for email in users_docker:
    if email not in users_host:
        print(f'  * {email}: {users_docker[email]}')

print('\n=== Role or EmployeeID Mismatches ===')
for email in users_host:
    if email in users_docker:
        h_name, h_role, h_empid = users_host[email]
        d_name, d_role, d_empid = users_docker[email]
        if h_role != d_role or h_empid != d_empid:
            print(f'  * {email}:')
            print(f'    Host  : Role={h_role}, EmpID={h_empid}')
            print(f'    Docker: Role={d_role}, EmpID={d_empid}')

c_host.close()
c_docker.close()
