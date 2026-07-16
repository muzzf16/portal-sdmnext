import shutil
import sqlite3
import os

def compare():
    # Copy to avoid locking
    shutil.copy('database.sqlite', 'temp_copy.sqlite')
    shutil.copy('temp_docker_db.sqlite', 'temp_copy_docker.sqlite')
    
    c1 = sqlite3.connect('temp_copy.sqlite')
    c2 = sqlite3.connect('temp_copy_docker.sqlite')
    
    u1 = set(c1.execute('SELECT email, role FROM pengguna').fetchall())
    u2 = set(c2.execute('SELECT email, role FROM pengguna').fetchall())
    
    print('In root but not in container:', u1 - u2)
    print('In container but not in root:', u2 - u1)
    
    # Check if there is an admin user whose role is different
    r1 = {email: role for email, role in c1.execute('SELECT email, role FROM pengguna').fetchall()}
    r2 = {email: role for email, role in c2.execute('SELECT email, role FROM pengguna').fetchall()}
    
    print('\nRole changes:')
    for email in r1:
        if email in r2 and r1[email] != r2[email]:
            print(f'  * {email}: root={r1[email]} -> container={r2[email]}')
            
    c1.close()
    c2.close()

if __name__ == '__main__':
    compare()
