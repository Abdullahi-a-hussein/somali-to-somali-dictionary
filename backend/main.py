import os
from dotenv import load_dotenv
import json
import redis
from fastapi import FastAPI, Header, HTTPException
from rapidfuzz import process, fuzz
from logger_config import setup_logging

from utils.data import find_word, connect_to_db, suggest_headwords

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

# Check if backened api is health

@app.get("/health")
def health(x_api_key: str = Header(None)):
    if not (ENV == "development"):
        verify_internal_key(x_api_key)
    return {"status": "ok"}



@app.get("/qaamuus/find/{word}")
def find_entry(word: str, x_api_key: str = Header(None)):
    if not (ENV == "development"):
        verify_internal_key(x_api_key)
    return find_word(word)


@app.get("/qaamuus/suggest/{prefix}")
def get_prefex(prefix: str, x_api_key: str = Header(None)):
    if not (ENV == "development"):
        verify_internal_key(x_api_key)
    return suggest_headwords(prefix, top_n=10)
