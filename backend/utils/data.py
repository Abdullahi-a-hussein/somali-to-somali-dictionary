import os
import sqlite3
import json
from rapidfuzz import fuzz
import logging

# local imports
from .schemas import Entry, Sense

# File internal file logger
logger = logging.getLogger(__name__)

CLEAN_JSON_DATA = "clean_json"
DB_FILE = "qaamuus.db"

# Path to all the files that need to be written to the database
PATHS = [f"{CLEAN_JSON_DATA}/{entry}" for entry in os.listdir(CLEAN_JSON_DATA)]

# Tables names
ENTRIES = "entries"
SENSES = "senses"
EXAMPLES = "examples"
CROSS_REFS = "cross_refs"


#normalization helper
def normalize_text(text: str) -> str:
    """
    Normalizes <text> to all be lowercase letters and splits on spaces
    """
    return " ".join(text.strip().lower().split())

def connect_to_db(db_name: str) -> sqlite3.Connection:
    logger.info("Connecting to database")
    connection = None
    try:
        connection = sqlite3.connect(db_name)
        connection.execute(
            f"PRAGMA foreign_keys = ON"
        )
        return connection
    except sqlite3.Error:
        logger.exception("Database connection Failed")
        raise


def setup() -> bool:
    """
    Create tables: ENTRIES, SENSES, EXAMPLES, CROSS_REFS
    Returns True if tables successfully created. Returns False otherwise.
    """
    connection = None
    if not PATHS:
        print("No files to load to db: Database not touched")
        return False
    try:
        connection = connect_to_db(DB_FILE)
        cursor = connection.cursor()
        tables = [ENTRIES, SENSES, EXAMPLES, CROSS_REFS]
        # Drop every table if already exist
        for table in tables:
            cursor.execute(
                f"""
                DROP TABLE IF EXISTS {table};
                """
            )

        # Creating tables

        # Create entries table
        cursor.execute(
            f"""
            CREATE TABLE {ENTRIES} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                headword TEXT NOT NULL,
                pos TEXT NOT NULL
            );
            """
        )

        # Create senses table
        cursor.execute(
            f"""
            CREATE TABLE {SENSES} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entry_id INTEGER NOT NULL,
                sense_order INTEGER NOT NULL,
                definition TEXT NOT NULL,
                FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
                );
            """
        )

        # Create examples table
        cursor.execute(
            f"""
            CREATE TABLE {EXAMPLES} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sense_id INTEGER NOT NULL,
                example_order INTEGER NOT NULL,
                example_text TEXT NOT NULL,
                FOREIGN KEY (sense_id) REFERENCES senses(id) ON DELETE CASCADE
            );
            """
        )

        # Create cross_refs
        cursor.execute(
            f"""
            CREATE TABLE {CROSS_REFS} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entry_id INTEGER NOT NULL,
                ref_order INTEGER NOT NULL,
                ref_text TEXT NOT NULL,
                FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
            )
            """
        )

        # Create indexes
        cursor.execute(
            f"""
            CREATE INDEX idx_entries_headword
            ON {ENTRIES}(headword);
            """
        )

        cursor.execute(
            f"""
            CREATE INDEX idx_senses_entry_id_sense_order
            ON {SENSES}(entry_id, sense_order);
            """
        )

        cursor.execute(
            f"""
            CREATE INDEX idx_examples_sense_id_example_order
            ON {EXAMPLES}(sense_id, example_order);
            """
        )

        cursor.execute(
            f"""
            CREATE INDEX idx_cross_refs_entry_id_ref_order
            ON {CROSS_REFS}(entry_id, ref_order);
            """
        )

        connection.close()
        return True
    except sqlite3.Error as e:
        print(f"Database Error: {e}")
        if connection:
            connection.close()
        return False
    finally:
        if connection:
            connection.close()


def load_data():
    """
    Loads data from all the json files in <PATHS> into the database
    within a single transaction.
    """
    print("\nStarting data loading process...")

    connection = None
    try:
        connection = connect_to_db(DB_FILE)
        cursor = connection.cursor()

        # DB transections starts here
        with connection:
            for path in PATHS:
                read_and_write(cursor, path)
        print("Transaction committed successfully. All data has been loaded.")
    except sqlite3.Error as e:
        print(f"Database error occurred: {e}")
        print("Transaction was rolled back. No data was saved.")

    finally:
        if connection:
            connection.close()


def record_one_entry(cursor: sqlite3.Cursor, entry: dict):
    # entering a row into the entries table
    cursor.execute(
        """
        INSERT INTO entries (headword, pos)
        VALUES (?, ?)
        """,
        (entry["headword"], entry["pos"])
    )

    entry_id = cursor.lastrowid

    # Entering a row in to  senses table
    for sense_index, sense in enumerate(entry["senses"], start=1):
        cursor.execute(
            f"""
            INSERT INTO {SENSES} (entry_id, sense_order, definition)
            VALUES (?, ?, ?)
            """,
            (entry_id, sense_index, sense["definition"])
        )
        sense_id = cursor.lastrowid

        # entering a row into the examples table
        for example_index, example in enumerate(sense.get("examples", []), start=1):
            cursor.execute(
                f"""
                INSERT INTO {EXAMPLES} (sense_id, example_order, example_text)
                VALUES (?, ?, ?)
                """,
                (sense_id, example_index, example)
            )
    for cross_ref_index, cross_ref in enumerate(entry.get("cross_refs", []), start=1):
        cursor.execute(
            f"""
            INSERT INTO {CROSS_REFS} (entry_id, ref_order, ref_text)
            VALUES (?, ?, ?)
            """,
            (entry_id, cross_ref_index, cross_ref)
        )


def read_and_write(cursor: sqlite3.Cursor, path: str):
    if os.path.exists(path):
        try:
            with open(path, "r") as file:
                content = json.load(file)
            for entry in content:
                # ensert into entries table
                record_one_entry(cursor, entry)
            print(
                f"Successfully processed and queued '{path}' for insertion.")
        except IOError as e:
            print(f"Can not read {path}: {e}")

            # Raising the error triggers db rollback
            raise


def verify_data_load():
    """
    Connect to the database and check if all the tables are created
    and data loaded as expected by printing out total number of entries
    in each table
    tables:
        entries
        senses,
        examples,
        cross_refs
    """

    # establish connection to database
    connection = None
    try:
        connection = connect_to_db(DB_FILE)
        cursor = connection.cursor()

        # Total rows of ENTRIES
        cursor.execute(
            f"SELECT COUNT(*) FROM {ENTRIES};"
        )
        ENTRIES_total = cursor.fetchone()[0]

        # Total count of senses rows
        cursor.execute(
            f"SELECT COUNT(*) FROM {SENSES};"
        )
        senses_total = cursor.fetchone()[0]

        # Total count of examples rows
        cursor.execute(
            f"SELECT COUNT(*) FROM {EXAMPLES};"
        )
        examples_total = cursor.fetchone()[0]
        # Total rows in cross_refs table
        cursor.execute(
            f"SELECT COUNT(*) FROM {CROSS_REFS};"
        )
        refs_total = cursor.fetchone()[0]

      

        totals = f"""
            total rows in ENTRIES table: {ENTRIES_total}\n
            total rows in sense table: {senses_total}\n
            total rows in examples table: {examples_total}\n
            total rows in cross_refs table: {refs_total}\n
            """
        print(totals)
    except sqlite3.Error as e:
        print(f"Database error: {e}")

    finally:
        if connection:
            connection.close()


# reading data from the database
def find_word(headword: str) -> list[Entry]:
    connection = None
    try:
        result = []
        connection = connect_to_db(DB_FILE)
        cursor = connection.cursor()

        # find word in entries table
        cursor.execute(
            f"""
            SELECT id, headword, pos FROM {ENTRIES}
            WHERE lower(headword) = lower(?)
            ORDER BY id
            """,
            (headword,)
        )
        entry_rows = cursor.fetchall()

        for entry_id, entry_headword, pos in entry_rows:
            entry_data = Entry(
                headword=entry_headword,
                pos=pos,
                senses=[],
                cross_refs=[]
            )
            get_senses(cursor, entry_data, entry_id)
            get_refs(cursor, entry_data, entry_id)
            result.append(entry_data)
        return result
    except sqlite3.Error:
        logger.exception("Database error while finding word: %s", headword)
        return []
    finally:
        if connection:
            connection.close()


def get_senses(cursor: sqlite3.Cursor, entry: Entry, entry_id: int) -> None:
    try:
        cursor.execute(
            f"""
            SELECT id, sense_order, definition FROM {SENSES}
            WHERE entry_id = ?
            ORDER BY sense_order
            """,
            (entry_id,)
        )
        sense_rows = cursor.fetchall()

        # Get the examples
        for sense_id, sense_order, definition in sense_rows:
            cursor.execute(
                f"""
                SELECT example_text FROM {EXAMPLES}
                WHERE sense_id = ?
                ORDER BY example_order
                """,
                (sense_id,)
            )
            example_rows = cursor.fetchall()
            examples = [row[0] for row in example_rows]
            sense = Sense(
                definition=definition,
                examples=examples
            )
            entry.senses.append(sense)

    except sqlite3.Error:
        logger.exception("Database error while fetching senses")
        raise


def get_refs(cursor: sqlite3.Cursor, entry: Entry, entry_id: int) -> None:
    """
    Gets the cross references for the for the headword with <entry_id> 
    and updates the value in <entry>
    """
    try:
        cursor.execute(
            f"""
            SELECT ref_text FROM {CROSS_REFS}
            WHERE entry_id = ?
            ORDER BY ref_order
            """,
            (entry_id,)
        )
        ref_rows = cursor.fetchall()
        entry.cross_refs = [row[0] for row in ref_rows]
    except sqlite3.Error:
        logger.exception("Database error while fetching cross_refs")
        raise


# fetches a reasonable pool from SQLit database

def fetch_primary_candidates(query: str, limit: int = 20) -> list[tuple[int, str]]:
    connection = None
    try:
        connection = connect_to_db(DB_FILE)
        cursor = connection.cursor()

        normalized_query = normalize_text(query)

        cursor.execute(
            f"""
            SELECT id, headword
            FROM {ENTRIES}
            WHERE lower(headword) = ?
               OR lower(headword) LIKE ?
            ORDER BY
                CASE
                    WHEN lower(headword) = ? THEN 0
                    WHEN lower(headword) LIKE ? THEN 1
                    ELSE 2
                END,
                headword
            LIMIT ?
            """,
            (
                normalized_query,
                f"{normalized_query}%",
                normalized_query,
                f"{normalized_query}%",
                limit,
            ),
        )

        return cursor.fetchall()

    except sqlite3.Error:
        logger.exception("Database error while fetching primary candidates: %s", query)
        return []
    finally:
        if connection:
            connection.close()

def fetch_contains_candidates(query: str, limit: int = 20) -> list[tuple[int, str]]:
    connection = None
    try:
        connection = connect_to_db(DB_FILE)
        cursor = connection.cursor()

        normalized_query = normalize_text(query)

        cursor.execute(
            f"""
            SELECT id, headword
            FROM {ENTRIES}
            WHERE lower(headword) LIKE ?
            ORDER BY headword
            LIMIT ?
            """,
            (
                f"%{normalized_query}%",
                limit,
            ),
        )

        return cursor.fetchall()

    except sqlite3.Error:
        logger.exception("Database error while fetching contains candidates: %s", query)
        return []
    finally:
        if connection:
            connection.close()
            

    
# Ranking function
def score_headword(query: str, headword: str) -> float:
    """
    Ranks <query> on how closely it matches with <headword>. 
    The more <query> resembles the <headword>, the higher the score.
    """
    q = normalize_text(query)
    h = normalize_text(headword)
    
    base_score = 0
    
    if h == q:
        base_score = 100
    elif h.startswith(q):
        base_score = 80
    elif q in h:
        base_score = 60
    fuzzy_bonus = fuzz.ratio(q, h) * 0.4
    return base_score + fuzzy_bonus


# suggest headwods 
def suggest_headwords(query: str, top_n: int = 10) -> list[str]:
    """
    returns the <top_n> words that closest ressemble query from the database
    
    Parameters
    ----------
    query: string
           string to be searched and matched on the database
    top_n: integer
           The number of matches to be returned from the database that match the query
    
    Returns
    -------
    list of strings || empty list
           returns a list of all the matches for the <query> or 
           empty list if no match is found
    """
    if not query or not query.strip():
        return []

    normalized_query = normalize_text(query)
    primary_candidates = fetch_primary_candidates(normalized_query, limit=top_n)

    results = []
    seen = set()

    for _, headword in primary_candidates:
        if headword not in seen:
            seen.add(headword)
            results.append(headword)
        if len(results) == top_n:
            return results

    if len(normalized_query) <= 2:
        return results

    remaining = top_n - len(results)
    fallback_candidates = fetch_contains_candidates(normalized_query, limit=remaining * 3)

    for _, headword in fallback_candidates:
        if headword not in seen:
            seen.add(headword)
            results.append(headword)
        if len(results) == top_n:
            break

    return results


