import sqlite3

def get_table_counts(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall() if not row[0].startswith('sqlite_')]
    counts = {}
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            counts[table] = cursor.fetchone()[0]
        except sqlite3.OperationalError:
            counts[table] = "ERROR"
    conn.close()
    return counts

def compare():
    prod = "/opt/portal-sdmv3/scratch/database_prod.sqlite"
    root_curr = "/opt/portal-sdmv3/database.sqlite"
    backup = "/opt/portal-sdmv3/db_backup_2026-07-10T04-00-50.sqlite"
    
    prod_counts = get_table_counts(prod)
    root_counts = get_table_counts(root_curr)
    backup_counts = get_table_counts(backup)
    
    all_tables = sorted(list(set(prod_counts.keys()) | set(root_counts.keys()) | set(backup_counts.keys())))
    
    print(f"{'Table Name':<30} | {'Prod Container':<15} | {'Root database':<15} | {'Backup 07-10':<15}")
    print("-" * 85)
    for table in all_tables:
        p_c = prod_counts.get(table, "N/A")
        r_c = root_counts.get(table, "N/A")
        b_c = backup_counts.get(table, "N/A")
        
        if p_c != r_c or p_c != b_c:
            print(f"{table:<30} | {str(p_c):<15} | {str(r_c):<15} | {str(b_c):<15}")
            
if __name__ == "__main__":
    compare()
