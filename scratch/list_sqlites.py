import os
import datetime

files = [f for f in os.listdir('.') if f.endswith('.sqlite')]
for f in sorted(files):
    try:
        mtime = datetime.datetime.fromtimestamp(os.path.getmtime(f))
        size = os.path.getsize(f)
        print(f'{f:<50} | Size: {size/1024/1024:6.3f} MB | Modified: {mtime}')
    except Exception as e:
        print(f'Error reading {f}: {e}')
