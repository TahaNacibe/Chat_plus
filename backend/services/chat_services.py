import sqlite3
import os
import json
from utils.sql_to_json import rows_to_json

class ChatServices:
    def __init__(self):
        #? get the path to the dbs directory
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_folder = os.path.join(base_dir, "db")
        
        #? create folder if doesn't exist
        os.makedirs(db_folder, exist_ok=True)
        #? create the db file
        db_path = os.path.join(db_folder, "chat_data.db")
        #? create connection and initialize table
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self._init_tables()
        


    #* Initialize the table
    def _init_tables(self):
        #? create chats table if not already existing
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT DEFAULT 'New Chat',
            is_archived BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)

        #? create the messages table if not already existing
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL,
            role TEXT CHECK(role IN ('user', 'assistant')) NOT NULL,
            content TEXT NOT NULL,
            is_archived BOOLEAN DEFAULT 0,
            original_message_id INTEGER DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
            FOREIGN KEY (original_message_id) REFERENCES messages(id) ON DELETE CASCADE
        )
        """)

        #? commit the changes 
        self.conn.commit()
    
    
    #? ----- Chat Related Services ------
    #* Create a new chat entry
    def create_new_entry(self, title="New Chat"):
        self.cursor.execute("INSERT INTO chats (title) VALUES (?)",(title,))
        self.conn.commit()
        new_chat_id = self.cursor.lastrowid
        
        #* get the new chat
        self.cursor.execute("SELECT * FROM chats WHERE id = ?", (new_chat_id,))
        rows = self.cursor.fetchone()
        
        if rows is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json([rows], labels)
        return json_data
    
    
    #* update a chat entry
    def update_chat_title(self, chat_id, new_title):
        self.cursor.execute("UPDATE chats SET title = ? WHERE id = ?", (new_title, chat_id))
        self.conn.commit()
        
    
    
    #* load chats list
    def load_chats_list(self):
        self.cursor.execute("SELECT * FROM chats ORDER BY created_at")
        rows = self.cursor.fetchall()
        labels = [desc[0] for desc in self.cursor.description]
        
        if rows is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        data = []
        print(f"rows are : {rows}\n------------------->\n")
        print(f"labels are : {labels}\n------------------->\n")
        for row in rows:
            row_dict = dict(zip(labels, row))
            # Convert is_archived field from int to bool
            if 'is_archived' in row_dict:
                row_dict['is_archived'] = bool(row_dict['is_archived'])
            data.append(row_dict)

        # Now convert to JSON format (if your rows_to_json expects list of dicts)
        
        print(f"data are : {data}\n------------------->\n")
        return data
    
    
    #* delete a chat entry from db (also remove messages related to the chat)
    def delete_chat_entry(self, chat_id):
        self.cursor.execute("DELETE FROM chats WHERE id = ? ",(chat_id,))
        self.conn.commit()
    
    
    #* toggle archive for a chat room
    def toggle_archive_chat(self, chat_id, current_state):
        state = 0 if current_state else 1
        self.cursor.execute("""
            UPDATE chats SET is_archived = ? WHERE id = ?
        """, (state,chat_id))
        self.conn.commit()
        
    
    #* search for a chat
    def search_for_chat(self, query):
        self.cursor.execute("""
            SELECT * FROM chats
            WHERE LOWER(title) LIKE LOWER(?)
        """, (f"%{query}%",))
        rows = self.cursor.fetchall()
        
        if rows is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json(rows, labels)
        return json_data
    
    
    #* load all archived chats
    def load_all_archived_chats(self):
        self.cursor.execute("SELECT * FROM chats WHERE is_archived = 1 ORDER BY created_at")
        rows = self.cursor.fetchall()
        
        if rows is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json(rows, labels)
        return json_data
    
    
    #* save a chat locally
    def save_chat_locally(self,chat_id:int):
        # fetch the metadata of the chat from db
        self.cursor.execute("SELECT * FROM chats WHERE id = ?",(chat_id,))
        chat_item = self.cursor.fetchone()
        labels = [desc[0] for desc in self.cursor.description]
        chat_metadata = rows_to_json([chat_item], labels)
        
        
        # get all messages for the chat
        self.cursor.execute("SELECT * from messages WHERE chat_id = ?",(chat_id,))
        messages_items = self.cursor.fetchall()
        labels = [desc[0] for desc in self.cursor.description]
        messages_list = rows_to_json([messages_items], labels)
        
        # structure JSON
        chat_data = {
            "chat_metadata": chat_metadata,
            "chat_content": messages_list
        }
        # Convert dict to JSON string
        json_string = json.dumps(chat_data, indent=2)
        return json_string



    #? --- Messages Related Services ----
    #* create a new message item 
    def create_new_message_entry(self, user_content: str, model_response: str, chat_id: int):
        # Insert user message
        self.cursor.execute(
            "INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)",
            (chat_id, "user", user_content)
        )
        user_msg_id = self.cursor.lastrowid

        # Insert assistant message
        self.cursor.execute(
            "INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)",
            (chat_id, "assistant", model_response)
        )
        assistant_msg_id = self.cursor.lastrowid

        self.conn.commit()

        # Fetch full message objects
        self.cursor.execute("SELECT * FROM messages WHERE id = ?", (user_msg_id,))
        user_msg = self.cursor.fetchone()
        
        if user_msg is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json([user_msg], labels)
        user_json = json_data

        self.cursor.execute("SELECT * FROM messages WHERE id = ?", (assistant_msg_id,))
        assistant_msg = self.cursor.fetchone()
        
        if assistant_msg is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        # switch json
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json([assistant_msg], labels)
        assistant_json = json_data
        

        return {
            "user_message": user_json,
            "assistant_message": assistant_json
        }


    
    
    #* get context for edited messages
    def get_context_for_regeneration(self,chat_id: int, original_message_id: int):
        self.cursor.execute("""
            SELECT * FROM messages
            WHERE chat_id = ?
            AND id <= (
                SELECT COALESCE(original_message_id, id)
                FROM messages
                WHERE id = ?
            )
            ORDER BY id
            LIMIT 10;
        """, (chat_id, original_message_id))
        return self.cursor.fetchall()
    
    
    #* get all regenerate of a message
    def get_all_regenerate_for_message(self,message_id:int):
        self.cursor("""
                    SELECT * FROM messages
                    WHERE original_message_id = ?
                    ORDER BY created_at;
                    """,(message_id,))
        rows = self.cursor.fetchall()
        
        if rows is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json(rows, labels)
        return json_data
    
    
    
    
    #* regenerate a message
    def regenerate_message(self, chat_id, new_content, new_reply, original_message_id, original_reply_id):
        # Insert regenerated assistant reply
        print(f"request for chat id with : {chat_id}")
        self.cursor.execute(
            "INSERT INTO messages (chat_id, role, content, original_message_id) VALUES (?, ?, ?, ?)",
            (chat_id, 'assistant', new_reply, original_reply_id)
        )
        assistant_msg_id = self.cursor.lastrowid
        self.conn.commit()

        self.cursor.execute("SELECT * FROM messages WHERE id = ?", (assistant_msg_id,))
        assistant_msg = self.cursor.fetchone()
        
        if assistant_msg is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        # switch json
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json([assistant_msg], labels)
        assistant_json = json_data
        

        return {
            "regenerated_assistant_message": assistant_json
        }


        
        
    #* load user chat content
    def load_all_chat_messages(self, chat_id):
        self.cursor.execute("SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at",(chat_id,))
        rows = self.cursor.fetchall()
        
        if rows is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json(rows, labels)
        return json_data
    
    
    #* load last n message
    def load_n_chat_messages(self, chat_id, k=5):
        self.cursor.execute(
            "SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT ?",
            (chat_id, k)
        )
        rows = self.cursor.fetchall()[::-1]
        
        if rows is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json(rows, labels)
        return json_data
    
    
    #* search for a message
    def search_for_message(self, query):
        self.cursor.execute("""
            SELECT * FROM messages
            WHERE LOWER(content) LIKE LOWER(?)
        """, (f"%{query}%",))
        rows = self.cursor.fetchall()
        
        if rows is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json(rows, labels)
        return json_data
    
    
    #* archive a message
    def toggle_archive_message(self, message_id, current_state):
        state = 0 if current_state else 1
        self.cursor.execute("""
            UPDATE messages SET is_archived = ? WHERE id = ?
        """, (state,message_id))
        self.conn.commit()
        
        
    #* load all archived messages
    def load_all_archived_messages(self):
        self.cursor.execute("SELECT * FROM messages WHERE is_archived = 1 ORDER BY created_at")
        rows = self.cursor.fetchall()
        
        if rows is None:
            raise ValueError("Chat insertion failed: No row returned.")
        
        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json(rows, labels)
        return json_data

    
    #* fetch all media from the db
    def fetch_media_content(self):
        types_to_match = ["file", "images", "links", "youtube_video", "source"]

        like_clauses = [
            f"content LIKE '%[BLOCK:%\"type\"%\"{t}\"%'" for t in types_to_match
        ]
        query = f"""
        SELECT * FROM messages
        WHERE {" OR ".join(like_clauses)}
        """

        self.cursor.execute(query)
        items = self.cursor.fetchall()

        if not items:
            raise ValueError("No matching media content found.")

        labels = [desc[0] for desc in self.cursor.description]
        json_data = rows_to_json(items, labels)
        return json_data
