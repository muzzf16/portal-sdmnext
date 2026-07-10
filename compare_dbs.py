import sqlite3

def compare_databases(db1_path, db2_path):
    conn1 = sqlite3.connect(db1_path)
    conn2 = sqlite3.connect(db2_path)
    
    cursor1 = conn1.cursor()
    cursor2 = conn2.cursor()
    
    # Get all tables from backup (db1)
    cursor1.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor1.fetchall() if not row[0].startswith('sqlite_')]
    
    print(f"{'Table Name':<35} | {'Backup DB':<15} | {'Current DB':<15} | {'Difference'}")
    print("-" * 80)
    
    differences_found = False
    
    for table in tables:
        # Get count from backup
        cursor1.execute(f"SELECT COUNT(*) FROM {table}")
        count1 = cursor1.fetchone()[0]
        
        # Get count from current (if table exists)
        try:
            cursor2.execute(f"SELECT COUNT(*) FROM {table}")
            count2 = cursor2.fetchone()[0]
        except sqlite3.OperationalError:
            count2 = "NOT EXISTS"
            
        if count1 != count2:
            diff = f"{count1 - count2 if isinstance(count2, int) else 'N/A'}"
            print(f"{table:<35} | {count1:<15} | {count2:<15} | {diff}")
            differences_found = True
            
    if not differences_found:
        print("No differences found in row counts for any tables.")
        
if __name__ == "__main__":
    backup_db = "/opt/portal-sdmv3/db_backup_2026-07-10T04-00-50.sqlite"
    current_db = "/opt/portal-sdmv3/database.sqlite"
    compare_databases(backup_db, current_db)
