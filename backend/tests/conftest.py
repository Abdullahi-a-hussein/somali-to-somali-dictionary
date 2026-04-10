import os
import sqlite3
import tempfile

import pytest
from fastapi.testclient import TestClient

from main import app
from utils import data


@pytest.fixture
def test_db():
    db_fd, db_path = tempfile.mkstemp(suffix=".db")

    connection = sqlite3.connect(db_path)
    connection.execute("PRAGMA foreign_keys = ON")
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            headword TEXT NOT NULL,
            pos TEXT NOT NULL
        );
    """)

    cursor.execute("""
        CREATE TABLE senses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            sense_order INTEGER NOT NULL,
            definition TEXT NOT NULL,
            FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
        );
    """)

    cursor.execute("""
        CREATE TABLE examples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sense_id INTEGER NOT NULL,
            example_order INTEGER NOT NULL,
            example_text TEXT NOT NULL,
            FOREIGN KEY (sense_id) REFERENCES senses(id) ON DELETE CASCADE
        );
    """)

    cursor.execute("""
        CREATE TABLE cross_refs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            ref_order INTEGER NOT NULL,
            ref_text TEXT NOT NULL,
            FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
        );
    """)

    cursor.execute("CREATE INDEX idx_entries_headword ON entries(headword);")
    cursor.execute("CREATE INDEX idx_senses_entry_id_sense_order ON senses(entry_id, sense_order);")
    cursor.execute("CREATE INDEX idx_examples_sense_id_example_order ON examples(sense_id, example_order);")
    cursor.execute("CREATE INDEX idx_cross_refs_entry_id_ref_order ON cross_refs(entry_id, ref_order);")

    # Entry 1: cilmi
    cursor.execute(
        "INSERT INTO entries (headword, pos) VALUES (?, ?)",
        ("cilmi", "Magac")
    )
    cilmi_entry_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO senses (entry_id, sense_order, definition) VALUES (?, ?, ?)",
        (cilmi_entry_id, 1, "Aqoon iyo barasho.")
    )
    cilmi_sense_1_id = cursor.lastrowid

    cursor.executemany(
        "INSERT INTO examples (sense_id, example_order, example_text) VALUES (?, ?, ?)",
        [
            (cilmi_sense_1_id, 1, "Cilmi waa iftiin."),
            (cilmi_sense_1_id, 2, "Wuxuu raadinayaa cilmi badan."),
        ],
    )

    cursor.execute(
        "INSERT INTO senses (entry_id, sense_order, definition) VALUES (?, ?, ?)",
        (cilmi_entry_id, 2, "Wax la barto ama la fahmo.")
    )
    cilmi_sense_2_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO examples (sense_id, example_order, example_text) VALUES (?, ?, ?)",
        (cilmi_sense_2_id, 1, "Cilmigu bulshada ayuu horumariyaa.")
    )

    cursor.executemany(
        "INSERT INTO cross_refs (entry_id, ref_order, ref_text) VALUES (?, ?, ?)",
        [
            (cilmi_entry_id, 1, "aqoon"),
            (cilmi_entry_id, 2, "garasho"),
        ],
    )

    # Entry 2: cilmibaare
    cursor.execute(
        "INSERT INTO entries (headword, pos) VALUES (?, ?)",
        ("cilmibaare", "Magac")
    )

    # Entry 3: cilmi-nafsi
    cursor.execute(
        "INSERT INTO entries (headword, pos) VALUES (?, ?)",
        ("cilmi-nafsi", "Magac")
    )

    # Entry 4: macalin
    cursor.execute(
        "INSERT INTO entries (headword, pos) VALUES (?, ?)",
        ("macalin", "Magac")
    )

    # Entry 5: cilmi with second POS, to test same headword multiple entries
    cursor.execute(
        "INSERT INTO entries (headword, pos) VALUES (?, ?)",
        ("cilmi", "Fal")
    )
    cilmi_entry_2_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO senses (entry_id, sense_order, definition) VALUES (?, ?, ?)",
        (cilmi_entry_2_id, 1, "Wax la xiriira cilmi raadis.")
    )

    # Entry 6: contains-only fallback candidate
    cursor.execute(
        "INSERT INTO entries (headword, pos) VALUES (?, ?)",
        ("barcilmi", "Magac")
    )

    connection.commit()
    connection.close()

    try:
        yield db_path
    finally:
        os.close(db_fd)
        os.remove(db_path)


@pytest.fixture
def client(test_db, monkeypatch):
    monkeypatch.setattr(data, "DB_FILE", test_db)
    if hasattr(data, "clear_suggestion_cache"):
        data.clear_suggestion_cache()
    return TestClient(app)