from utils.schemas import Entry

HEALTH_ROUTE = "/health"
SUGGEST_ROUTE = "/qaamuus/suggest"
FIND_ROUTE = "/qaamuus/find"


def test_health_route_returns_200(client):
    response = client.get(HEALTH_ROUTE)
    assert response.status_code == 200


def test_suggest_route_returns_prefix_first_results(client):
    response = client.get(f"{SUGGEST_ROUTE}/cil")
    assert response.status_code == 200

    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) > 0

    # These should be strong prefix suggestions
    assert "cilmi" in payload
    assert "cilmibaare" in payload
    assert "cilmi-nafsi" in payload

    # If contains fallback is used at all, it should not dominate early
    if "barcilmi" in payload:
        assert payload.index("barcilmi") > payload.index("cilmi")


def test_suggest_route_exact_word_appears(client):
    response = client.get(f"{SUGGEST_ROUTE}/cilmi")
    assert response.status_code == 200

    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) > 0
    assert payload[0] == "cilmi"


def test_suggest_route_unknown_word_returns_empty_list(client):
    response = client.get(f"{SUGGEST_ROUTE}/zzzznotfound")
    assert response.status_code == 200
    assert response.json() == []


def test_find_route_returns_structured_entry_list(client):
    response = client.get(f"{FIND_ROUTE}/cilmi")
    assert response.status_code == 200

    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) >= 1

    entries = [Entry(**item) for item in payload]

    first = entries[0]
    assert first.headword == "cilmi"
    assert isinstance(first.pos, str)
    assert isinstance(first.senses, list)
    assert isinstance(first.cross_refs, list)
    assert len(first.senses) >= 1

    first_sense = first.senses[0]
    assert isinstance(first_sense.definition, str)
    assert isinstance(first_sense.examples, list)


def test_find_route_returns_examples_and_cross_refs(client):
    response = client.get(f"{FIND_ROUTE}/cilmi")
    assert response.status_code == 200

    payload = response.json()
    entries = [Entry(**item) for item in payload]

    noun_entry = next(entry for entry in entries if entry.pos == "Magac")

    assert noun_entry.headword == "cilmi"
    assert len(noun_entry.senses) == 2
    assert noun_entry.senses[0].definition == "Aqoon iyo barasho."
    assert noun_entry.senses[0].examples == [
        "Cilmi waa iftiin.",
        "Wuxuu raadinayaa cilmi badan.",
    ]
    assert noun_entry.cross_refs == ["aqoon", "garasho"]


def test_find_route_multiple_entries_same_headword(client):
    response = client.get(f"{FIND_ROUTE}/cilmi")
    assert response.status_code == 200

    payload = response.json()
    entries = [Entry(**item) for item in payload]

    assert len(entries) == 2
    assert {entry.pos for entry in entries} == {"Magac", "Fal"}


def test_find_route_unknown_word_returns_empty_list(client):
    response = client.get(f"{FIND_ROUTE}/notarealword")
    assert response.status_code == 200
    assert response.json() == []


def test_suggest_route_cache_does_not_change_response(client):
    response_1 = client.get(f"{SUGGEST_ROUTE}/cil")
    assert response_1.status_code == 200
    payload_1 = response_1.json()

    response_2 = client.get(f"{SUGGEST_ROUTE}/cil")
    assert response_2.status_code == 200
    payload_2 = response_2.json()

    assert payload_1 == payload_2


def test_find_route_response_schema_is_valid_for_all_items(client):
    response = client.get(f"{FIND_ROUTE}/cilmi")
    assert response.status_code == 200

    payload = response.json()
    entries = [Entry(**item) for item in payload]

    for entry in entries:
        assert isinstance(entry.headword, str)
        assert isinstance(entry.pos, str)
        assert isinstance(entry.senses, list)
        assert isinstance(entry.cross_refs, list)
        for sense in entry.senses:
            assert isinstance(sense.definition, str)
            assert isinstance(sense.examples, list)

def test_short_query_does_not_prioritize_contains_matches(client):
    response = client.get(f"{SUGGEST_ROUTE}/ci")
    assert response.status_code == 200
    payload = response.json()

    assert "cilmi" in payload
    if "barcilmi" in payload:
        assert payload.index("barcilmi") > payload.index("cilmi")