import sqlite3
import redis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rapidfuzz import process, fuzz
import json

# --- Configuration ---
DATABASE_FILE = 'qaamuus.db'
REDIS_HOST = 'localhost'
REDIS_PORT = 6379

# --- FastAPI App Initialization ---
app = FastAPI()

# Allow frontend to access backend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Redis Connection ---
# Use decode_responses=True to get strings back from Redis instead of bytes
try:
    redis_client = redis.Redis(
        host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
    redis_client.ping()
    print("Successfully connected to Redis.")
except redis.exceptions.ConnectionError as e:
    print(f"Could not connect to Redis: {e}")
    redis_client = None

# --- API Endpoints ---


@app.get("/suggest/{prefix}", response_model=list[list[str]])
def suggest(prefix: str):
    """
    Suggest words based on a prefix.
    First, it performs a direct prefix search. If no results are found,
    it falls back to a fuzzy search to find the closest match.
    """
    if not prefix:
        return []

    prefix_lower = prefix.lower()
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()

        # 1. Standard Prefix Search
        cursor.execute(
            "SELECT headword, definition FROM qaamuus WHERE headword LIKE ? ORDER BY headword LIMIT 10",
            (prefix_lower + '%',)
        )
        matches = cursor.fetchall()

        if matches:
            return matches

        # 2. Fuzzy Search Fallback (if no direct matches)
        first_letter = prefix_lower[0]
        cursor.execute(
            "SELECT headword FROM qaamuus WHERE headword LIKE ?", (first_letter + '%',))
        all_words_for_letter = [row[0] for row in cursor.fetchall()]

        if not all_words_for_letter:
            return []

        # Find the best match using rapidfuzz
        best_match = process.extractOne(
            prefix_lower, all_words_for_letter, scorer=fuzz.WRatio)

        # best_match is a tuple: (word, score, index) or None
        # Use a similarity score threshold of 75
        if best_match and best_match[1] > 75:
            closest_word = best_match[0]
            # Fetch the definition for the closest word
            cursor.execute(
                "SELECT headword, definition FROM qaamuus WHERE headword = ?", (closest_word,))
            final_suggestion = cursor.fetchone()
            return [final_suggestion] if final_suggestion else []

        return []

    finally:
        if conn:
            conn.close()


@app.get("/define/{word}")
def define(word: str):
    """
    Get the definition of a single word.
    Checks Redis cache first. If not found, queries the database and caches the result.
    """
    word_lower = word.lower()

    # 1. Check Redis Cache
    if redis_client:
        cached_definition = redis_client.get(word_lower)
        if cached_definition:
            return json.loads(cached_definition)

    # 2. Query Database if not in cache
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT headword, definition FROM qaamuus WHERE headword = ?", (word_lower,))
        result = cursor.fetchone()

        if result:
            definition_obj = {"headword": result[0], "definition": result[1]}
            # 3. Store result in Redis cache for 1 hour (3600 seconds)
            if redis_client:
                redis_client.set(word_lower, json.dumps(
                    definition_obj), ex=3600)
            return definition_obj

        return {"error": "Word not found"}
    finally:
        if conn:
            conn.close()
