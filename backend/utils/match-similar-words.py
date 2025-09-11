
import csv
import re
import os
PATTERN = re.compile("[¹²³⁴⁵⁶⁷⁸⁹⁰]$")
WORDS_PATH = "words"
CORRECTED_WORDS = "corrected_words"

definition_number = re.compile(r"\s(\d+)\.\s")


def extract_number_from_end(s: str):
    matches = list(definition_number.finditer(s))
    if matches:
        last_match = matches[-1]  # last occurrence (closest to end)
        return True, int(last_match.group(1))
    return False, -1


def match_words(read_file_path: str, write_file_path: str) -> None:

    container = []
    with open(read_file_path, mode='r', encoding='utf-8') as file:
        reader = csv.reader(file)
        next(reader)
        for row in reader:
            if not (PATTERN.search(row[0])):
                container.append(row)
            else:
                if container and row[0][:-1].lower().strip() == container[-1][0].lower().strip():
                    container[-1][1] += " " + row[0] + " " + row[1]
                elif not container:
                    new_headword = [row[0][:-1], row[1]]
                    container.append(new_headword)
    print(f"Started Writing to {write_file_path}")
    with open(write_file_path, mode='w', encoding="utf-8") as file:
        writer = csv.writer(file)

        writer.writerow(["headword", "definition"])
        writer.writerows(container)
    print(f"{len(container)} written to {write_file_path}")


def load_corrected_words():
    letters = [entry for entry in os.listdir("words")]
    target = [
        f"corrected_words/{entry}" for entry in os.listdir("corrected_words")]
    if not target:
        for letter in letters:
            read_file_path = f"words/{letter}"
            write_file_path = f"corrected_words/{letter}"
            match_words(read_file_path, write_file_path)
    else:
        print("correct_letters already written to")


if __name__ == "__main__":
    load_corrected_words()
