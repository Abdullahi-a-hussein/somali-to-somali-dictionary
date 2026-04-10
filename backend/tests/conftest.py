# tests/conftest.py
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import sqlite3
from fastapi.testclient import TestClient
import pytest
import tempfile
from main import app
from utils import data
from utils.schemas import Entry


client = TestClient(app)

SUGGEST_ROUTE = "/qaamuus/suggest/"
FIND_ROUTE = "/qaamuus/find"


@pytest.fixture
def test_db():
    db_fd, db_path = tempfile.mkstemp()

    connection = sqlite3.connect(db_path)
    connection.execute("PRAGMA foreign_keys = ON")
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            headword TEXT NOT NULL,
            pos TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE senses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            sense_order INTEGER NOT NULL,
            definition TEXT NOT NULL,
            FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
        )
    """)

    cursor.execute("""
        CREATE TABLE examples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sense_id INTEGER NOT NULL,
            example_order INTEGER NOT NULL,
            example_text TEXT NOT NULL,
            FOREIGN KEY (sense_id) REFERENCES senses(id) ON DELETE CASCADE
        )
    """)

    cursor.execute("""
        CREATE TABLE cross_refs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            ref_order INTEGER NOT NULL,
            ref_text TEXT NOT NULL,
            FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
        )
    """)

    cursor.executemany(
        "INSERT INTO entries (headword, pos) VALUES (?, ?)",
        [
            ("ceeb", "Magac"),
            ("ceebaal", "Magac"),
            ("ceebayn", "Magac"),
            ("macee", "Magac"),
            ("sheeko", "Magac"),
            ("cilmi", "Magac")
        ],
    )
    
    
    cursor

    connection.commit()
    connection.close()

    yield db_path

    os.close(db_fd)
    os.remove(db_path)
    
def test_prefix_query_integration(monkeypatch, test_db):
    #override DB patch
    monkeypatch.setattr(data, "DB_FILE", test_db)
    results = data.fetch_primary_candidates("ce", limit=10)
    headwords = [row[1] for row in results]
    assert "ceeb" in headwords
    assert "ceebaal" in headwords
    assert "ceebayn" in headwords
    
def test_suggest_headwords_integration(monkeypatch, test_db):
    monkeypatch.setattr(data, "DB_FILE", test_db)
    
    results = data.suggest_headwords("ceeb", top_n=5)
    assert results[0] == "ceeb"
    assert "ceebaal" in results
    
# Testing routes

# Testing word suggestion
def test_suggest_route_e2e(monkeypatch, test_db):
    monkeypatch.setattr(data, "DB_FILE", test_db)
    data.clear_suggestion_cache()
    test_word = "sheek"
    response = client.get(f"{SUGGEST_ROUTE}/{test_word}")
    assert response.status_code == 200
    payload = response.json()
    
    assert isinstance(payload, list)
    assert isinstance(payload[0], str)
    assert "sheeko" in payload
    
# Testing find word route

def test_find_route_e2e(monkeypatch, test_db):
    monkeypatch.setattr(data, "DB_FILE", test_db)

    test_word = "cilmi"
    response = client.get(f"{FIND_ROUTE}/{test_word}")

    assert response.status_code == 200

    payload = response.json()

    assert isinstance(payload, list)
    assert len(payload) > 0

    entries = [Entry(**item) for item in payload]

    entry = entries[0]

    assert isinstance(entry.senses, list)
    assert isinstance(entry.cross_refs, list)

    # validate full schema
    assert entries[0].model_dump() == {
        "headword": "cilmi",
        "pos": "Magac",
        "senses": [...],
        "cross_refs": []
}
     