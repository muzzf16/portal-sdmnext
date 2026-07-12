import sqlite3
import json

db_current_path = "/opt/portal-sdmv3/database.sqlite"
db_backup_path = "/opt/portal-sdmv3/db_backup_2026-07-10T04-00-50.sqlite"

def get_pegawai_data(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='pegawai'")
    if not cursor.fetchone():
        print(f"Table 'pegawai' does not exist in {db_path}")
        return {}
        
    cursor.execute("SELECT * FROM pegawai")
    rows = cursor.fetchall()
    
    data = {}
    for row in rows:
        row_dict = dict(row)
        data[row_dict['id']] = row_dict
        
    conn.close()
    return data

def compare():
    current_data = get_pegawai_data(db_current_path)
    backup_data = get_pegawai_data(db_backup_path)
    
    current_ids = set(current_data.keys())
    backup_ids = set(backup_data.keys())
    
    print(f"Current DB Pegawai Count: {len(current_ids)}")
    print(f"Backup DB Pegawai Count: {len(backup_ids)}")
    
    added = current_ids - backup_ids
    removed = backup_ids - current_ids
    common = current_ids & backup_ids
    
    if added:
        print(f"\nAdded Pegawai IDs in Current DB ({len(added)}):")
        for idx in added:
            print(f" - {idx}: {current_data[idx].get('name')} (NIP: {current_data[idx].get('nip')})")
            
    if removed:
        print(f"\nRemoved Pegawai IDs in Current DB ({len(removed)}):")
        for idx in removed:
            print(f" - {idx}: {backup_data[idx].get('name')} (NIP: {backup_data[idx].get('nip')})")
            
    # Check differences in common records
    diff_count = 0
    for idx in common:
        curr_row = current_data[idx]
        back_row = backup_data[idx]
        
        row_diff = {}
        # We only check columns that exist in both
        common_cols = set(curr_row.keys()) & set(back_row.keys())
        
        for col in common_cols:
            val_curr = curr_row[col]
            val_back = back_row[col]
            
            # Normalize JSON fields for comparison if needed
            if col in ['educationHistory', 'workHistory', 'trainingCertificates', 'payrollInfo']:
                try:
                    # parse and compare as objects
                    obj_curr = json.loads(val_curr) if val_curr else []
                    obj_back = json.loads(val_back) if val_back else []
                    if obj_curr != obj_back:
                        row_diff[col] = (val_back, val_curr)
                except Exception:
                    if val_curr != val_back:
                        row_diff[col] = (val_back, val_curr)
            else:
                if val_curr != val_back:
                    row_diff[col] = (val_back, val_curr)
                    
        if row_diff:
            diff_count += 1
            print(f"\nDifferences for Pegawai: {curr_row.get('name')} (ID: {idx}, NIP: {curr_row.get('nip')})")
            for col, (b_val, c_val) in row_diff.items():
                print(f"  Field '{col}':")
                print(f"    Backup : {b_val}")
                print(f"    Current: {c_val}")
                
    if diff_count == 0:
        print("\nNo differences found in existing records' common fields.")

if __name__ == "__main__":
    compare()
