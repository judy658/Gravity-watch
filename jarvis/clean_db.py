import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "jarvis.db")
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE session_id='active'")
    conn.commit()
    conn.close()
    print("SOHBET HAFIZASI BÜYÜK BİR TİTİZLİKLE SIFIRLANDI.")
except Exception as e:
    print(f"HATA: {e}")
