import sqlite3
import glob

def search_across_dbs(pattern):
    db_files = glob.glob("/opt/portal-sdmv3/*.sqlite*")
    for db_file in db_files:
        try:
            conn = sqlite3.connect(db_file)
            cursor = conn.cursor()
            
            # Check if table activity_library exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='activity_library';")
            if not cursor.fetchone():
                continue
                
            cursor.execute(f"SELECT id, activityName, position FROM activity_library WHERE LOWER(activityName) LIKE '%{pattern}%';")
            rows = cursor.fetchall()
            
            if rows:
                print(f"--- Found in {db_file} ---")
                for row in rows:
                    print(row)
                    
        except Exception as e:
            pass # ignore encrypted or locked dbs

if __name__ == "__main__":
    search_across_dbs("pemindah bukuan kredit")
