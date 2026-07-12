import sqlite3
import json

db_prod_path = "/opt/portal-sdmv3/scratch/database_prod.sqlite"
db_root_path = "/opt/portal-sdmv3/database.sqlite"

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
    prod_data = get_pegawai_data(db_prod_path)
    root_data = get_pegawai_data(db_root_path)
    
    prod_ids = set(prod_data.keys())
    root_ids = set(root_data.keys())
    
    print(f"Prod Container Pegawai Count: {len(prod_ids)}")
    print(f"Root DB Pegawai Count: {len(root_ids)}")
    
    added = prod_ids - root_ids
    removed = root_ids - prod_ids
    common = prod_ids & root_ids
    
    if added:
        print(f"\nAdded Pegawai in Prod Container ({len(added)}):")
        for idx in added:
            print(f" - {idx}: {prod_data[idx].get('name')} (NIP: {prod_data[idx].get('nip')})")
            
    if removed:
        print(f"\nRemoved Pegawai in Prod Container ({len(removed)}):")
        for idx in removed:
            print(f" - {idx}: {root_data[idx].get('name')} (NIP: {root_data[idx].get('nip')})")
            
    # Check differences in common records
    diff_count = 0
    for idx in common:
        prod_row = prod_data[idx]
        root_row = root_data[idx]
        
        row_diff = {}
        # We only check columns that exist in both
        common_cols = set(prod_row.keys()) & set(root_row.keys())
        
        for col in common_cols:
            val_prod = prod_row[col]
            val_root = root_row[col]
            
            # Normalize JSON fields for comparison
            if col in ['educationHistory', 'workHistory', 'trainingCertificates', 'payrollInfo']:
                try:
                    obj_prod = json.loads(val_prod) if val_prod else []
                    obj_root = json.loads(val_root) if val_root else []
                    if obj_prod != obj_root:
                        row_diff[col] = (val_root, val_prod)
                except Exception:
                    if val_prod != val_root:
                        row_diff[col] = (val_root, val_prod)
            else:
                if val_prod != val_root:
                    row_diff[col] = (val_root, val_prod)
                    
        if row_diff:
            diff_count += 1
            print(f"\nDifferences for Pegawai: {prod_row.get('name')} (ID: {idx}, NIP: {prod_row.get('nip')})")
            for col, (r_val, p_val) in row_diff.items():
                print(f"  Field '{col}':")
                print(f"    Root DB: {r_val}")
                print(f"    Prod Container: {p_val}")
                
    if diff_count == 0:
        print("\nNo differences found in existing records' common fields.")

if __name__ == "__main__":
    compare()
