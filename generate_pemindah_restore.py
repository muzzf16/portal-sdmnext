import sqlite3
import uuid

def generate_pemindah_restore(backup_db_path, output_sql_path):
    conn = sqlite3.connect(backup_db_path)
    cursor = conn.cursor()
    
    # Get all "pemindah" activities
    cursor.execute("SELECT position, department, activityName, durationMinutes, outputUnit, category, default_nominal FROM activity_library WHERE LOWER(activityName) LIKE '%pemindah%';")
    rows = cursor.fetchall()
    
    with open(output_sql_path, 'w') as f:
        f.write("BEGIN TRANSACTION;\n\n")
        
        for row in rows:
            # Generate a new ID to avoid conflict with the ones that got renamed
            new_id = f"act-restored-{uuid.uuid4().hex[:8]}"
            pos, dept, name, duration, out_unit, cat, default_nom = row
            
            # handle NULLs properly
            dept_val = f"'{dept}'" if dept else "NULL"
            out_unit_val = f"'{out_unit}'" if out_unit else "NULL"
            cat_val = f"'{cat}'" if cat else "NULL"
            default_nom_val = str(default_nom) if default_nom is not None else "NULL"
            
            f.write(f"INSERT INTO activity_library (id, position, department, activityName, durationMinutes, outputUnit, category, default_nominal) ")
            f.write(f"VALUES ('{new_id}', '{pos}', {dept_val}, '{name}', {duration}, {out_unit_val}, {cat_val}, {default_nom_val});\n")
            
        f.write("\nCOMMIT;\n")

if __name__ == "__main__":
    backup_db = "/opt/portal-sdmv3/db_backup_2026-07-10T04-00-50.sqlite"
    output_sql = "/opt/portal-sdmv3/restore_pemindah.sql"
    generate_pemindah_restore(backup_db, output_sql)
