import pytest

from utils.data import (
    normalize_text,
    _suggest_headwords,
    suggest_headwords,
    clear_suggestion_cache,
)


def test_normalize_text_basic():
    assert normalize_text("  CeEb  ") == "ceeb"


def test_empty_query_returns_empty_list():
    assert _suggest_headwords("") == []
    assert _suggest_headwords("   ") == []


def test_exact_and_prefix_prioritized_over_contains(monkeypatch):
    def fake_primary(query: str, limit: int = 10):
        return [
            (1, "ceeb"),
            (2, "ceebaal"),
            (3, "ceebayn"),
        ]

    def fake_contains(query: str, limit: int = 10):
        return [
            (10, "macee"),
            (11, "laace"),
        ]

    monkeypatch.setattr("utils.data.fetch_primary_candidates", fake_primary)
    monkeypatch.setattr("utils.data.fetch_contains_candidates", fake_contains)

    results = _suggest_headwords("cee", top_n=5)

    assert results[:3] == ["ceeb", "ceebaal", "ceebayn"]
    assert results[3:] == ["macee", "laace"]


def test_contains_used_only_when_primary_is_insufficient(monkeypatch):
    def fake_primary(query: str, limit: int = 10):
        return [
            (1, "ceeb"),
            (2, "ceebaal"),
        ]

    def fake_contains(query: str, limit: int = 10):
        return [
            (10, "macee"),
            (11, "laace"),
        ]

    monkeypatch.setattr("utils.data.fetch_primary_candidates", fake_primary)
    monkeypatch.setattr("utils.data.fetch_contains_candidates", fake_contains)

    results = _suggest_headwords("ceeb", top_n=4)

    assert results == ["ceeb", "ceebaal", "macee", "laace"]


def test_short_queries_skip_contains_fallback(monkeypatch):
    def fake_primary(query: str, limit: int = 10):
        return [
            (1, "ceeb"),
            (2, "ceebaal"),
        ]

    called = {"contains": False}

    def fake_contains(query: str, limit: int = 10):
        called["contains"] = True
        return [
            (10, "macee"),
        ]

    monkeypatch.setattr("utils.data.fetch_primary_candidates", fake_primary)
    monkeypatch.setattr("utils.data.fetch_contains_candidates", fake_contains)

    results = _suggest_headwords("ce", top_n=5)

    assert results == ["ceeb", "ceebaal"]
    assert called["contains"] is False


def test_duplicate_headwords_are_removed(monkeypatch):
    def fake_primary(query: str, limit: int = 10):
        return [
            (1, "ceeb"),
            (2, "ceebaal"),
        ]

    def fake_contains(query: str, limit: int = 10):
        return [
            (99, "ceeb"),
            (11, "laace"),
        ]

    monkeypatch.setattr("utils.data.fetch_primary_candidates", fake_primary)
    monkeypatch.setattr("utils.data.fetch_contains_candidates", fake_contains)

    results = _suggest_headwords("ceeb", top_n=4)

    assert results == ["ceeb", "ceebaal", "laace"]


def test_cached_and_uncached_results_match(monkeypatch):
    def fake_primary(query: str, limit: int = 10):
        return [
            (1, "ceeb"),
            (2, "ceebaal"),
        ]

    def fake_contains(query: str, limit: int = 10):
        return []

    monkeypatch.setattr("utils.data.fetch_primary_candidates", fake_primary)
    monkeypatch.setattr("utils.data.fetch_contains_candidates", fake_contains)

    clear_suggestion_cache()

    uncached = _suggest_headwords("  CEEB ", top_n=5)
    cached = suggest_headwords("  CEEB ", top_n=5)

    assert cached == uncached
