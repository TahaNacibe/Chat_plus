import os, sqlite3, numpy as np, faiss, pickle, hashlib
from sentence_transformers import SentenceTransformer

class RAGServices:
    def __init__(self, db_name="rag.db", faiss_index_path="rag.index"):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        db_folder = os.path.join(base_dir, "db")
        os.makedirs(db_folder, exist_ok=True)

        self.db_path = os.path.join(db_folder, db_name)
        self.faiss_index_path = os.path.join(db_folder, faiss_index_path)

        self.embedding_dim = 384
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")

        self.conn = sqlite3.connect(self.db_path)
        self.cursor = self.conn.cursor()
        self._init_tables()
        self._load_faiss_index()


    def _init_tables(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY,
                filename TEXT,
                extension TEXT,
                title TEXT,
                chat_id TEXT,
                hash TEXT UNIQUE,
                tags TEXT
            )
        ''')
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS chunks (
                id INTEGER PRIMARY KEY,
                file_id INTEGER,
                content TEXT,
                embedding BLOB,
                FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
            )
        ''')
        self.cursor.execute('''
            CREATE VIRTUAL TABLE IF NOT EXISTS content_index USING fts5(content, file_id UNINDEXED)
        ''')
        self.conn.commit()


    def _load_faiss_index(self):
        meta_path = self.faiss_index_path + ".meta"
        if os.path.exists(self.faiss_index_path) and os.path.exists(meta_path):
            self.index = faiss.read_index(self.faiss_index_path)
            with open(self.faiss_index_path + ".meta", "rb") as f:
                self.chunk_texts = pickle.load(f)
        else:
            self.index = faiss.IndexFlatL2(self.embedding_dim)
            self.chunk_texts = []


    def _save_faiss_index(self):
        faiss.write_index(self.index, self.faiss_index_path)
        with open(self.faiss_index_path + ".meta", "wb") as f:
            pickle.dump(self.chunk_texts, f)


    def _compute_hash(self, content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()


    def save_to_db(self, file_text, filename, extension, title, is_isolated, chat_id, tags="", chunk_size=200):
        file_hash = self._compute_hash(file_text)

        self.cursor.execute("SELECT id FROM files WHERE hash = ?", (file_hash,))
        if self.cursor.fetchone():
            print("Duplicate file ignored.")
            return

        self.cursor.execute('''
            INSERT INTO files (filename, extension, title, chat_id, hash, tags)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (filename, extension, title, chat_id, file_hash, tags))
        file_id = self.cursor.lastrowid

        chunks = [file_text[i:i+chunk_size] for i in range(0, len(file_text), chunk_size)]
        embeddings = self.embedder.encode(chunks)

        for chunk, emb in zip(chunks, embeddings):
            emb_blob = pickle.dumps(emb)
            self.cursor.execute('''
                INSERT INTO chunks (file_id, content, embedding)
                VALUES (?, ?, ?)
            ''', (file_id, chunk, emb_blob))

            self.chunk_texts.append(chunk)
            self.index.add(np.array([emb]).astype("float32"))

            # Also add to full-text search index
            self.cursor.execute('''
                INSERT INTO content_index (content, file_id)
                VALUES (?, ?)
            ''', (chunk, file_id))

        self.conn.commit()
        self._save_faiss_index()


    def rag_query(self, question, chat_id=None, k=3, keyword_fallback=True):
        query_emb = self.embedder.encode([question]).astype("float32")

        if self.index.ntotal == 0:
            if keyword_fallback:
                return self.keyword_search(question, k)
            return ["No indexed documents found."]

        # FAISS search
        D, I = self.index.search(query_emb, k * 2)  # search wider for filtering
        faiss_results = []
        seen = set()

        for idx in I[0]:
            if idx >= len(self.chunk_texts):
                continue

            # Find which file this chunk belongs to
            chunk_text = self.chunk_texts[idx]
            self.cursor.execute('''
                SELECT files.chat_id FROM chunks
                JOIN files ON chunks.file_id = files.id
                WHERE chunks.content = ?
                LIMIT 1
            ''', (chunk_text,))
            row = self.cursor.fetchone()
            if not row:
                continue
            chunk_chat_id = row[0]

            # Prioritize: exact chat match or global (NULL)
            if chat_id is None or chunk_chat_id == chat_id or chunk_chat_id is None:
                if chunk_text not in seen:
                    faiss_results.append(chunk_text)
                    seen.add(chunk_text)
            if len(faiss_results) >= k:
                break

        # If FAISS result is insufficient and fallback enabled
        if len(faiss_results) < k and keyword_fallback:
            needed = k - len(faiss_results)
            keyword_hits = self.keyword_search(question, needed)
            for kw in keyword_hits:
                if kw not in seen:
                    faiss_results.append(kw)
                    seen.add(kw)
                    if len(faiss_results) >= k:
                        break

        if not faiss_results:
            return ["No relevant documents found."]

        return faiss_results

    
    def keyword_search(self, keyword: str, k=3):
        self.cursor.execute('''
            SELECT content FROM content_index
            WHERE content MATCH ?
            LIMIT ?
        ''', (keyword, k))
        return [row[0] for row in self.cursor.fetchall()]


    def remove_file(self, file_id):
        self.cursor.execute("DELETE FROM files WHERE id = ?", (file_id,))
        self.conn.commit()
        # You should also rebuild FAISS from scratch in real app to remove those vectors



    def load_all_rag_files(self):
        self.cursor.execute("SELECT id, filename, extension, title, chat_id, tags FROM files")
        rows = self.cursor.fetchall()
        files = [
        {
            "id": row[0],
            "filename": row[1],
            "extension": row[2],
            "title": row[3],
            "chat_id": row[4],
            "tags": row[5]
        }
        for row in rows
        ]
        return {"files": files}

    def close(self):
        self.conn.commit()
        self.conn.close()
        self._save_faiss_index()


    def __del__(self):
        try:
            self.close()
        except:
            pass
