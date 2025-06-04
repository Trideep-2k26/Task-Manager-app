#!/usr/bin/env python3
import sys
import json
import numpy as np
from sentence_transformers import SentenceTransformer
import psycopg2
from psycopg2.extras import RealDictCursor
import os

class VectorSearchService:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.db_config = {
            'host': os.environ.get('DB_HOST', 'localhost'),
            'port': os.environ.get('DB_PORT', '5432'),
            'database': os.environ.get('DB_NAME', 'taskmanager'),
            'user': os.environ.get('DB_USER', 'postgres'),
            'password': os.environ.get('DB_PASSWORD', 'password')
        }

    def get_connection(self):
        return psycopg2.connect(**self.db_config)

    def generate_embedding(self, text):
        if not text:
            return None
        embedding = self.model.encode(text)
        return embedding.tolist()

    def update_task_embedding(self, task_id, description):
        if not description:
            return
        embedding = self.generate_embedding(description)
        if not embedding:
            return
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            embedding_str = '[' + ', '.join(map(str, embedding)) + ']'
            cur.execute(
                "UPDATE tasks SET embedding = %s WHERE id = %s",
                (embedding_str, task_id)
            )
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            print(f"Error updating embedding: {e}", file=sys.stderr)

    def search_similar_tasks(self, query, limit=3):
        try:
            query_embedding = self.generate_embedding(query)
            if not query_embedding:
                return []
            conn = self.get_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            query_vector = '[' + ', '.join(map(str, query_embedding)) + ']'
            cur.execute("""
                SELECT id, title, description, status,
                (embedding <-> %s::vector) as distance
                FROM tasks
                WHERE embedding IS NOT NULL
                ORDER BY embedding <-> %s::vector
                LIMIT %s
            """, (query_vector, query_vector, limit))
            results = cur.fetchall()
            cur.close()
            conn.close()
            return [dict(row) for row in results]
        except Exception as e:
            print(f"Error in vector search: {e}", file=sys.stderr)
            return []

def main():
    if len(sys.argv) != 3:
        print("Usage: python vector_service.py <action> <data>", file=sys.stderr)
        sys.exit(1)
    action = sys.argv[1]
    data = json.loads(sys.argv[2])
    service = VectorSearchService()
    if action == 'update_embedding':
        service.update_task_embedding(data['task_id'], data['description'])
        print(json.dumps({'success': True}))
    elif action == 'search':
        results = service.search_similar_tasks(data['query'])
        print(json.dumps(results))
    else:
        print(json.dumps({'error': 'Unknown action'}))
        sys.exit(1)

if __name__ == '__main__':
    main()