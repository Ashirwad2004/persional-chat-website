import sqlite3

def migrate():
    conn = sqlite3.connect('nexuschat.db')
    cursor = conn.cursor()
    
    try:
        # Add last_seen to users
        cursor.execute("ALTER TABLE users ADD COLUMN last_seen DATETIME DEFAULT CURRENT_TIMESTAMP")
        print("Added last_seen to users.")
    except sqlite3.OperationalError as e:
        print(f"last_seen column might already exist: {e}")

    try:
        # Add status to messages
        cursor.execute("ALTER TABLE messages ADD COLUMN status VARCHAR DEFAULT 'sent'")
        print("Added status to messages.")
        
        # We also need to map existing is_read True -> 'read', False -> 'delivered' perhaps?
        cursor.execute("UPDATE messages SET status = 'read' WHERE is_read = 1")
        cursor.execute("UPDATE messages SET status = 'delivered' WHERE is_read = 0 AND sender_id != receiver_id AND timestamp < datetime('now', '-5 seconds')")
        print("Updated legacy is_read values into status.")
    except sqlite3.OperationalError as e:
        print(f"status column might already exist: {e}")

    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == '__main__':
    migrate()
