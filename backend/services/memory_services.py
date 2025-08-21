import os
import sqlite3
import numpy as np
import faiss
import pickle
from sentence_transformers import SentenceTransformer

from utils.sql_to_json import rows_to_json

class MemoryServices:
    def __init__(self):
        #? get path for the db
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_folder = os.path.join(base_dir, "db")
        os.makedirs(db_folder, exist_ok=True)
        self.db_path = os.path.join(db_folder, "memory.db")
        #? embedding the memory
        self.embedding_dim = 384
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')

        #? get connection and cursor 
        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        self._init_tables()


    #* start the init table 
    def _init_tables(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                chat_id TEXT,
                content TEXT,
                weight INTEGER,
                embedding BLOB
            )
        ''')
        self.conn.commit()


    #* Save a new memory (with optional chat_id)
    def save(self, content: str, chat_id: str = None):
        #? embed the content
        embedding = self.embedder.encode([content["content"]])[0]
        emb_blob = pickle.dumps(embedding)

        #? execute the SQL command
        self.cursor.execute('''
            INSERT INTO memories (chat_id, content, weight,embedding)
            VALUES (?, ?, ?,?)
        ''', (chat_id, content["content"], content["weight"] ,emb_blob))
        self.conn.commit()
        
        
    def create_memory_manually(self, content:str, weight:int):
        #? embed the content
        embedding = self.embedder.encode([content])[0]
        emb_blob = pickle.dumps(embedding)

        #? execute the SQL command
        self.cursor.execute('''
            INSERT INTO memories (content, weight,embedding)
            VALUES ( ?, ?,?)
        ''', (content, weight ,emb_blob))
        self.conn.commit()
        id = self.cursor.lastrowid
        
        self.cursor.execute("SELECT id, content, created_at FROM memories WHERE id = ?",(id,))
        row = self.cursor.fetchone()
        
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json([row], labels)
        return json_data


    #* Fetch similar memories by chat_id (optional)
    def fetch(self, query: str, chat_id: str = None, k: int = 3):
        #? get the memories based on the situation 
        self.cursor.execute('''
        SELECT id, content, embedding FROM memories
        ORDER BY created_at
        ''')

        #? fetch all items
        rows = self.cursor.fetchall()
        if not rows:
            return []

        #? index the memories
        index = faiss.IndexFlatL2(self.embedding_dim)
        memory_texts = []
        memory_ids = []

        for mem_id, content, emb_blob in rows:
            memory_ids.append(mem_id)
            memory_texts.append(content)
            index.add(np.array([pickle.loads(emb_blob)]))

        query_emb = self.embedder.encode([query])
        D, I = index.search(np.array(query_emb), k)
        return [memory_texts[i] for i in I[0]]



    #* Get all memories
    def get_all(self):
        self.cursor.execute("SELECT id, content, created_at FROM memories ORDER BY created_at")
        rows = self.cursor.fetchall()
        
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json(rows, labels)
        return json_data



    #* Update a memory's content by ID
    def update(self, memory_id: int, new_content: str):
        new_embedding = self.embedder.encode([new_content])[0]
        emb_blob = pickle.dumps(new_embedding)

        self.cursor.execute('''
            UPDATE memories
            SET content = ?, embedding = ?
            WHERE id = ?
        ''', (new_content, emb_blob, memory_id))
        self.conn.commit()
        
        
    #* Update a memory's content by ID
    def delete(self, memory_id: int):
        self.cursor.execute('''
            DELETE FROM memories WHERE id = ?''', (memory_id,))
        self.conn.commit()



    #* Return memory count
    def get_size(self):
        self.cursor.execute("SELECT COUNT(*) FROM memories")
        return self.cursor.fetchone()[0]



    def close(self):
        self.conn.commit()
        self.conn.close()



    def __del__(self):
        try:
            self.close()
        except:
            pass
