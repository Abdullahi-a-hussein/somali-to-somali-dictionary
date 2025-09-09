import sqlite3
import csv
import os
import string

DB_FILE = "qaamuus.db"
TABLE_NAME = "qaamuus"
PATHS = [f"words/{entry}" for entry in os.listdir("words")]
PATHS.sort()


def setup_database():
    """
    Sets up the database, creating the table and the index.
    This function will overwrite the existing table if it exists.
    """
    # conn is a connection object
    conn = None
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        # Drop the table if it already exists to start fresh
        cursor.execute(f"DROP TABLE IF EXISTS {TABLE_NAME}")
        print(f"Dropped existing table '{TABLE_NAME}' if it existed.")

        # Create the qaamuus table
        print("Creating table...")
        cursor.execute(f"""
            CREATE TABLE {TABLE_NAME} (
                id INTEGER PRIMARY KEY,
                headword TEXT NOT NULL,
                definition TEXT
            );
        """)

        # Create an index on the headword column for fast searching
        print("Creating index on 'headword' column...")
        cursor.execute(
            f"CREATE INDEX idx_headword ON {TABLE_NAME} (headword);")

        conn.commit()
        print("Database setup complete. Table and index created.")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        if conn:
            conn.close()


def load_data_in_transaction():
    """
    Loads data from all alphabet CSV files into the database
    within a single transaction.
    """
    print("\nStarting data loading process...")
    conn = None
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        # The 'with' statement handles the transaction automatically.
        # It will BEGIN TRANSACTION before the block and
        # COMMIT automatically if the block succeeds.
        # If any error occurs, it will ROLLBACK.
        with conn:
            print("Transaction started...")
            # Loop through 'a' to 'z'
            for path in PATHS:
                if os.path.exists(path):
                    try:
                        with open(path, 'r', encoding='utf-8') as f:
                            reader = csv.reader(f)
                            next(reader)
                            # Assuming CSV has two columns: headword, definition
                            for row in reader:
                                headword = row[0]
                                definition = row[1] if len(row) > 1 else ''
                                cursor.execute(
                                    f"INSERT INTO {TABLE_NAME} (headword, definition) VALUES (?, ?)",
                                    (headword, definition)
                                )
                            print(
                                f"Successfully processed and queued '{path}' for insertion.")
                    except (IOError, csv.Error) as e:
                        print(f"Error reading {path}: {e}")
                        # Raise the error again to trigger the transaction rollback
                        raise

        print("Transaction committed successfully. All data has been loaded.")

    except sqlite3.Error as e:
        print(f"Database error occurred: {e}")
        print("Transaction was rolled back. No data was saved.")
    finally:
        if conn:
            conn.close()


def verify_data():
    """Connects to the DB and prints the number of records to verify loading."""
    conn = None
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute(f"SELECT COUNT(*) FROM {TABLE_NAME}")
        count = cursor.fetchone()[0]
        print(
            f"\nVerification complete. The '{TABLE_NAME}' table contains {count} records.")

        cursor.execute(f"SELECT * FROM {TABLE_NAME} LIMIT 5")
        print("First 5 records:")
        for row in cursor.fetchall():
            print(row)

    except sqlite3.Error as e:
        print(f"Could not verify data. Error: {e}")
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    setup_database()
    load_data_in_transaction()
    verify_data()
