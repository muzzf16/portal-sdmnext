import sqlite3

def generate_restore_script(backup_db_path, output_sql_path):
    conn = sqlite3.connect(backup_db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall() if not row[0].startswith('sqlite_')]
    
    with open(output_sql_path, 'w') as f:
        f.write("PRAGMA foreign_keys=OFF;\n")
        f.write("ATTACH DATABASE '/tmp/db_backup.sqlite' AS backup;\n")
        f.write("BEGIN TRANSACTION;\n\n")
        
        for table in tables:
            f.write(f"INSERT OR IGNORE INTO {table} SELECT * FROM backup.{table};\n")
            
        f.write("\nCOMMIT;\n")
        f.write("DETACH DATABASE backup;\n")
        f.write("PRAGMA foreign_keys=ON;\n")
        
    print(f"Generated restore script at {output_sql_path}")

if __name__ == "__main__":
    backup_db = "/opt/portal-sdmv3/db_backup_2026-07-10T04-00-50.sqlite"
    output_sql = "/opt/portal-sdmv3/restore_all_missing.sql"
    generate_restore_script(backup_db, output_sql)
