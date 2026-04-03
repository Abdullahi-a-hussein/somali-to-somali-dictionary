import os
from dotenv import load_dotenv
import json
import sqlite3
import redis
from fastapi import FastAPI, Header, HTTPException
from rapidfuzz import process, fuzz
from logger_config import setup_logging

from utils.data import find_word, connect_to_db, get_starting_at

# --- Configuration ---

# setup loggin
setup_logging()

# Load environment variables
load_dotenv()

DATABASE_FILE = os.getenv("DATABASE_FILE", "qaamuus.db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
# secret key shared with Next.js
API_KEY = os.getenv("API_KEY")
ENV = os.getenv("ENV")

# --- App Initialization ---
app = FastAPI(title="Qaamuus API", version="1.0.0")

# --- Redis Setup ---
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()
    print("✅: Connected to Redis.")
except redis.exceptions.ConnectionError as e:
    print(f"⚠️: Redis connection failed: {e}")
    redis_client = None

# --- Utility ---


def verify_internal_key(x_api_key: str = Header(None)):
    """Allow only requests with a valid internal API key."""
    if API_KEY is None:
        raise HTTPException(
            status_code=500, detail="Server misconfiguration: missing API_KEY")
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=403, detail="Forbidden: invalid API key")


# --- API Endpoints ---

@app.get("/qaamuus/suggest/{prefix}", response_model=list[list[str]])
def suggest(prefix: str, x_api_key: str = Header(None)):
    """Return suggested Somali words for a given prefix."""
    if not (ENV == "development"):
        verify_internal_key(x_api_key)

    if not prefix:
        return []

    prefix_lower = prefix.lower()

    with connect_to_db(DATABASE_FILE) as conn:
        cursor = conn.cursor()

        # 1. Direct prefix search
        cursor.execute(
            "SELECT headword, definition FROM qaamuus WHERE headword LIKE ? ORDER BY headword LIMIT 10",
            (prefix_lower + "%",)
        )
        matches = cursor.fetchall()
        if matches:
            return matches

        # 2. Fuzzy fallback search
        first_letter = prefix_lower[0]
        cursor.execute(
            "SELECT headword FROM qaamuus WHERE headword LIKE ?", (first_letter + "%",))
        all_words = [row[0] for row in cursor.fetchall()]
        if not all_words:
            return []

        best_match = process.extractOne(
            prefix_lower, all_words, scorer=fuzz.WRatio)
        if best_match and best_match[1] > 75:
            cursor.execute(
                "SELECT headword, definition FROM qaamuus WHERE headword = ?", (best_match[0],))
            result = cursor.fetchone()
            return [result] if result else []

    return []


@app.get("/qaamuus/define/{word}")
def define(word: str, x_api_key: str = Header(None)):
    """Return the definition of a Somali word (cached with Redis)."""
    verify_internal_key(x_api_key)

    word_lower = word.lower()

    # 1. Try Redis cache first
    if redis_client:
        cached = redis_client.get(word_lower)
        if cached:
            return json.loads(cached)

    # 2. Query database
    with connect_to_db(DATABASE_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT headword, definition FROM qaamuus WHERE headword = ?", (word_lower,))
        result = cursor.fetchone()

        if not result:
            return {"error": "Word not found"}

        data = {"headword": result[0], "definition": result[1]}

        # 3. Cache in Redis
        if redis_client:
            redis_client.set(word_lower, json.dumps(data), ex=3600)

        return data


@app.get("/qaamuus/clean/find/{word}")
def find_entry(word: str, x_api_key: str = Header(None)):
    return find_word(word)


@app.get("/qaamuus/clean/suggest/{prefix}")
def get_prefex(prefix: str, x_api_key: str = Header(None)):
    return get_starting_at(prefix.lower())
