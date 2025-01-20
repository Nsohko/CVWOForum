#!/bin/bash

# Path to the SQLite database file
DB_PATH="./database.db"

# Backup directory
BACKUP_DIR="./backups/"

# Timestamp for the backup file
TIMESTAMP=$(date +'%Y%m%d%H%M')

# Backup file name
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sqlite"

# Ensure the backup directory exists
mkdir -p "$BACKUP_DIR"

# Copy the database file to the backup directory
cp "$DB_PATH" "$BACKUP_FILE"

# Delete backups older than 7 days
find "$BACKUP_DIR" -type f -name "*.sqlite" -mtime +7 -exec rm {} \;

echo "SQLite database backup completed: $BACKUP_FILE"
