import sqlite3

DB_PATH = "hashes.db"

def init_db():
    """Initialize the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS video_hashes (
            video_name TEXT,
            frame_path TEXT,
            phash TEXT
        )
    """)
    conn.commit()
    conn.close()

def store_hashes(video_name, frame_hashes):
    """Store pHashes in the database while avoiding duplicates."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    for frame_path, phash in frame_hashes.items():
        cursor.execute("SELECT COUNT(*) FROM video_hashes WHERE phash = ?", (phash,))
        if cursor.fetchone()[0] == 0:  # Only insert if it doesn't exist
            cursor.execute("INSERT INTO video_hashes VALUES (?, ?, ?)", (video_name, frame_path, phash))

    conn.commit()
    conn.close()

def check_duplicate(phash):
    """Check if the pHash already exists in the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT video_name FROM video_hashes WHERE phash = ?", (phash,))
    result = cursor.fetchone()
    conn.close()
    return result is not None  # True if a match is found
