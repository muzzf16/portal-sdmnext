#!/bin/bash
DB="/opt/portal-sdmv3/database.sqlite"

# Get all tables
TABLES=$(sqlite3 "$DB" "SELECT name FROM sqlite_master WHERE type='table';")

for TABLE in $TABLES; do
    # Check if created_at exists
    HAS_CREATED_AT=$(sqlite3 "$DB" "PRAGMA table_info($TABLE);" | grep -i "created_at" || true)
    HAS_CREATEDAT=$(sqlite3 "$DB" "PRAGMA table_info($TABLE);" | grep -i "createdAt" || true)
    HAS_TANGGAL=$(sqlite3 "$DB" "PRAGMA table_info($TABLE);" | grep -i "tanggal" || true)
    
    if [ ! -z "$HAS_CREATED_AT" ]; then
        MAX_VAL=$(sqlite3 "$DB" "SELECT MAX(created_at) FROM $TABLE;")
        if [ ! -z "$MAX_VAL" ]; then
            echo "Table $TABLE max created_at: $MAX_VAL"
        fi
    fi
    if [ ! -z "$HAS_CREATEDAT" ]; then
        MAX_VAL=$(sqlite3 "$DB" "SELECT MAX(createdAt) FROM $TABLE;")
        if [ ! -z "$MAX_VAL" ]; then
            echo "Table $TABLE max createdAt: $MAX_VAL"
        fi
    fi
    if [ ! -z "$HAS_TANGGAL" ]; then
        MAX_VAL=$(sqlite3 "$DB" "SELECT MAX(tanggal) FROM $TABLE;")
        if [ ! -z "$MAX_VAL" ]; then
            echo "Table $TABLE max tanggal: $MAX_VAL"
        fi
    fi
done
