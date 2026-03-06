from __future__ import annotations

import argparse
import csv
import io
import json
import random
import re
import tarfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "src" / "data" / "generated"
OUT_DIR.mkdir(parents=True, exist_ok=True)

MUSE_URL = "https://dl.fbaipublicfiles.com/arrival/dictionaries.tar.gz"
NOUNS_URL = "https://raw.githubusercontent.com/gambolputty/german-nouns/master/german_nouns/nouns.csv"
IPA_URL = "https://raw.githubusercontent.com/open-dict-data/ipa-dict/master/data/de.txt"


def read_tar_text(url: str, member_name: str) -> str:
    with urllib.request.urlopen(url) as resp:
        tf = tarfile.open(fileobj=resp, mode="r|gz")
        for member in tf:
            if member.name == member_name:
                fileobj = tf.extractfile(member)
                if fileobj is None:
                    break
                return fileobj.read().decode("utf-8")
    raise RuntimeError(f"Missing tar member: {member_name}")


def parse_muse_pairs(text: str) -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = []
    for line in text.splitlines():
        parts = line.strip().split()
        if len(parts) < 2:
            continue
        pairs.append((parts[0], parts[1]))
    return pairs


def is_simple_word(value: str) -> bool:
    if not value:
        return False
    if " " in value or "-" in value or "." in value or "," in value:
        return False
    if any(char.isdigit() for char in value):
        return False
    return re.fullmatch(r"[A-Za-zÄÖÜäöüß]+", value) is not None


def load_muse_maps(max_entries: int) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    de_en_text = read_tar_text(MUSE_URL, "dictionaries/de-en.txt")
    en_zh_text = read_tar_text(MUSE_URL, "dictionaries/en-zh.txt")
    de_en_pairs = parse_muse_pairs(de_en_text)
    en_zh_pairs = parse_muse_pairs(en_zh_text)

    de_en_map: dict[str, list[str]] = {}
    seen = set()
    for de, en in de_en_pairs:
        if not is_simple_word(de):
            continue
        de_en_map.setdefault(de, [])
        if en not in de_en_map[de]:
            de_en_map[de].append(en)
        if de not in seen:
            seen.add(de)
        if len(seen) >= max_entries:
            break

    en_zh_map: dict[str, list[str]] = {}
    for en, zh in en_zh_pairs:
        en_zh_map.setdefault(en, [])
        if zh not in en_zh_map[en]:
            en_zh_map[en].append(zh)

    return de_en_map, en_zh_map


def pick_first(row: dict[str, str], columns: list[str]) -> str | None:
    for col in columns:
        value = row.get(col, "").strip()
        if value:
            return value
    return None


def download_text(url: str, retries: int = 3) -> str:
    last_error: Exception | None = None
    for _ in range(retries):
        try:
            with urllib.request.urlopen(url) as resp:
                return resp.read().decode("utf-8")
        except Exception as exc:
            last_error = exc
    raise RuntimeError(f"Failed to download {url}") from last_error


def load_noun_map() -> dict[str, dict[str, str]]:
    text = download_text(NOUNS_URL)
    reader = csv.DictReader(io.StringIO(text))
    plural_cols = [
        "nominativ plural",
        "nominativ plural*",
        "nominativ plural 1",
        "nominativ plural 2",
        "nominativ plural 3",
        "nominativ plural 4",
    ]
    genitive_cols = [
        "genitiv singular",
        "genitiv singular*",
        "genitiv singular 1",
        "genitiv singular 2",
        "genitiv singular 3",
        "genitiv singular 4",
    ]
    noun_map: dict[str, dict[str, str]] = {}
    for row in reader:
        lemma = (row.get("lemma") or "").strip()
        if not lemma or not is_simple_word(lemma):
            continue
        gender = (row.get("genus") or "").strip()
        plural = pick_first(row, plural_cols) or ""
        genitive = pick_first(row, genitive_cols) or ""
        noun_map[lemma.lower()] = {
            "lemma": lemma,
            "gender": gender,
            "plural": plural,
            "genitive": genitive,
        }
    return noun_map


def load_ipa_map() -> dict[str, list[str]]:
    ipa_map: dict[str, list[str]] = {}
    text = download_text(IPA_URL)
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = re.split(r"\s+", line, maxsplit=1)
        if len(parts) < 2:
            continue
        word = parts[0]
        ipa_raw = parts[1]
        ipa_items = []
        for item in ipa_raw.split(","):
            item = item.strip()
            if item.startswith("/") and item.endswith("/"):
                item = item[1:-1]
            if item:
                ipa_items.append(item)
        if ipa_items:
            ipa_map[word.lower()] = ipa_items
    return ipa_map


def build_vocabulary(max_entries: int) -> list[dict[str, object]]:
    de_en_map, en_zh_map = load_muse_maps(max_entries)
    noun_map = load_noun_map()
    ipa_map = load_ipa_map()

    entries: list[dict[str, object]] = []
    for de in sorted(de_en_map.keys()):
        if not is_simple_word(de):
            continue
        en_list = de_en_map[de]
        zh_candidates: list[str] = []
        for en in en_list:
            zh_candidates.extend(en_zh_map.get(en, []))
        zh_unique = []
        for zh in zh_candidates:
            if zh not in zh_unique:
                zh_unique.append(zh)
        noun_info = noun_map.get(de.lower())
        ipa = ipa_map.get(de.lower()) or []
        entry = {
            "de": noun_info["lemma"] if noun_info else de,
            "en": en_list[0],
            "en_variants": en_list,
            "zh": zh_unique[:3],
            "pos": "noun" if noun_info else "other",
            "gender": noun_info["gender"] if noun_info else "",
            "plural": noun_info["plural"] if noun_info else "",
            "genitive": noun_info["genitive"] if noun_info else "",
            "ipa": ipa[:3],
        }
        entries.append(entry)
    return entries


SUBJECTS = [
    {"de": "Ich", "en": "I", "person": 1, "number": "singular"},
    {"de": "Du", "en": "you", "person": 2, "number": "singular"},
    {"de": "Er", "en": "he", "person": 3, "number": "singular"},
    {"de": "Sie", "en": "she", "person": 3, "number": "singular"},
    {"de": "Wir", "en": "we", "person": 1, "number": "plural"},
    {"de": "Ihr", "en": "you", "person": 2, "number": "plural"},
    {"de": "Sie", "en": "they", "person": 3, "number": "plural"},
]

ADJECTIVES = [
    {"de": "gut", "en": "good"},
    {"de": "groß", "en": "big"},
    {"de": "klein", "en": "small"},
    {"de": "neu", "en": "new"},
    {"de": "alt", "en": "old"},
]

ADVERBS = [
    {"de": "gern", "en": "gladly"},
    {"de": "oft", "en": "often"},
    {"de": "heute", "en": "today"},
    {"de": "morgen", "en": "tomorrow"},
]

LOCATIONS = [
    {"de": "im Park", "en": "in the park"},
    {"de": "zu Hause", "en": "at home"},
    {"de": "in Berlin", "en": "in Berlin"},
    {"de": "bei der Arbeit", "en": "at work"},
]

VERBS = [
    {
        "infinitive": "sein",
        "en": "be",
        "present": {"1s": "bin", "2s": "bist", "3s": "ist", "1p": "sind", "2p": "seid", "3p": "sind"},
        "past": {"1s": "war", "2s": "warst", "3s": "war", "1p": "waren", "2p": "wart", "3p": "waren"},
    },
    {
        "infinitive": "haben",
        "en": "have",
        "present": {"1s": "habe", "2s": "hast", "3s": "hat", "1p": "haben", "2p": "habt", "3p": "haben"},
        "past": {"1s": "hatte", "2s": "hattest", "3s": "hatte", "1p": "hatten", "2p": "hattet", "3p": "hatten"},
    },
    {
        "infinitive": "sehen",
        "en": "see",
        "present": {"1s": "sehe", "2s": "siehst", "3s": "sieht", "1p": "sehen", "2p": "seht", "3p": "sehen"},
        "past": {"1s": "sah", "2s": "sahst", "3s": "sah", "1p": "sahen", "2p": "saht", "3p": "sahen"},
    },
    {
        "infinitive": "gehen",
        "en": "go",
        "present": {"1s": "gehe", "2s": "gehst", "3s": "geht", "1p": "gehen", "2p": "geht", "3p": "gehen"},
        "past": {"1s": "ging", "2s": "gingst", "3s": "ging", "1p": "gingen", "2p": "gingt", "3p": "gingen"},
    },
    {
        "infinitive": "kommen",
        "en": "come",
        "present": {"1s": "komme", "2s": "kommst", "3s": "kommt", "1p": "kommen", "2p": "kommt", "3p": "kommen"},
        "past": {"1s": "kam", "2s": "kamst", "3s": "kam", "1p": "kamen", "2p": "kamt", "3p": "kamen"},
    },
    {
        "infinitive": "kaufen",
        "en": "buy",
        "present": {"1s": "kaufe", "2s": "kaufst", "3s": "kauft", "1p": "kaufen", "2p": "kauft", "3p": "kaufen"},
        "past": {"1s": "kaufte", "2s": "kauftest", "3s": "kaufte", "1p": "kauften", "2p": "kauftet", "3p": "kauften"},
    },
    {
        "infinitive": "lesen",
        "en": "read",
        "present": {"1s": "lese", "2s": "liest", "3s": "liest", "1p": "lesen", "2p": "lest", "3p": "lesen"},
        "past": {"1s": "las", "2s": "last", "3s": "las", "1p": "lasen", "2p": "last", "3p": "lasen"},
    },
    {
        "infinitive": "lernen",
        "en": "learn",
        "present": {"1s": "lerne", "2s": "lernst", "3s": "lernt", "1p": "lernen", "2p": "lernt", "3p": "lernen"},
        "past": {"1s": "lernte", "2s": "lerntest", "3s": "lernte", "1p": "lernten", "2p": "lerntet", "3p": "lernten"},
    },
    {
        "infinitive": "essen",
        "en": "eat",
        "present": {"1s": "esse", "2s": "isst", "3s": "isst", "1p": "essen", "2p": "esst", "3p": "essen"},
        "past": {"1s": "aß", "2s": "aßest", "3s": "aß", "1p": "aßen", "2p": "aßt", "3p": "aßen"},
    },
    {
        "infinitive": "trinken",
        "en": "drink",
        "present": {"1s": "trinke", "2s": "trinkst", "3s": "trinkt", "1p": "trinken", "2p": "trinkt", "3p": "trinken"},
        "past": {"1s": "trank", "2s": "trankst", "3s": "trank", "1p": "tranken", "2p": "trankt", "3p": "tranken"},
    },
]


def get_article(gender: str, case_type: str) -> str:
    if case_type == "accusative":
        if gender == "m":
            return "einen"
        if gender == "f":
            return "eine"
        if gender == "n":
            return "ein"
    if gender == "f":
        return "eine"
    return "ein"


def get_adj_ending(gender: str, case_type: str) -> str:
    if case_type == "accusative":
        if gender == "m":
            return "en"
        if gender == "f":
            return "e"
        if gender == "n":
            return "es"
    if gender == "f":
        return "e"
    if gender == "n":
        return "es"
    return "er"


def conjugate_english(verb: str, subject: dict[str, object]) -> str:
    if verb == "be":
        if subject["en"] == "I":
            return "am"
        if subject["number"] == "singular":
            return "is"
        return "are"
    if verb == "have":
        if subject["number"] == "singular" and subject["person"] == 3:
            return "has"
        return "have"
    if subject["number"] == "singular" and subject["person"] == 3:
        if verb.endswith(("ch", "s", "sh", "x", "z")):
            return f"{verb}es"
        return f"{verb}s"
    return verb


def build_sentences(vocab: list[dict[str, object]], target_count: int) -> list[dict[str, object]]:
    nouns = [entry for entry in vocab if entry["pos"] == "noun" and entry["gender"]]
    nouns = sorted(nouns, key=lambda n: n["de"])
    nouns = nouns[:max(240, min(len(nouns), 600))]

    level_configs = {
        "A0": {"adjective": False, "adverb": False, "location": False},
        "A1": {"adjective": False, "adverb": False, "location": True},
        "A2": {"adjective": True, "adverb": False, "location": True},
        "B1": {"adjective": True, "adverb": True, "location": True},
    }
    level_order = ["A0", "A1", "A2", "B1"]
    ratios = [0.2, 0.25, 0.3, 0.25]
    level_counts = [max(1, int(target_count * ratio)) for ratio in ratios]
    while sum(level_counts) < target_count:
        level_counts[sum(level_counts) % len(level_counts)] += 1
    while sum(level_counts) > target_count:
        for idx in range(len(level_counts)):
            if level_counts[idx] > 1 and sum(level_counts) > target_count:
                level_counts[idx] -= 1

    all_sentences: list[dict[str, object]] = []
    for idx, level in enumerate(level_order):
        cfg = level_configs[level]
        rng = random.Random(100 + idx)
        for _ in range(level_counts[idx]):
            subject = rng.choice(SUBJECTS)
            verb = rng.choice(VERBS)
            noun = rng.choice(nouns)
            adjective = rng.choice(ADJECTIVES) if cfg["adjective"] else None
            adverb = rng.choice(ADVERBS) if cfg["adverb"] else None
            location = rng.choice(LOCATIONS) if cfg["location"] else None

            gender = noun["gender"]
            article = get_article(gender, "accusative")
            noun_de = noun["de"]
            if adjective:
                noun_de = f"{article} {adjective['de']}{get_adj_ending(gender, 'accusative')} {noun_de}"
            else:
                noun_de = f"{article} {noun_de}"

            verb_de = verb["present"][f"{subject['person']}{'s' if subject['number'] == 'singular' else 'p'}"]
            verb_en = conjugate_english(verb["en"], subject)

            german_parts = [subject["de"], verb_de]
            english_parts = [subject["en"], verb_en]
            if adverb:
                german_parts.append(adverb["de"])
                english_parts.append(adverb["en"])
            german_parts.append(noun_de)
            english_parts.append(f"a {noun['en']}")
            if location:
                german_parts.append(location["de"])
                english_parts.append(location["en"])

            german_sentence = " ".join(german_parts) + "."
            english_sentence = " ".join(english_parts) + "."

            all_sentences.append(
                {
                    "german": german_sentence,
                    "english": english_sentence,
                    "parts": german_parts,
                    "level": level,
                    "meta": {
                        "subject": subject,
                        "verbBase": {
                            "de": verb["present"]["1s"],
                            "en": verb["en"],
                            "infinitive": verb["infinitive"],
                            "objectCategories": ["noun"],
                        },
                        "object": {"de": noun["de"], "en": noun["en"], "category": "noun"},
                        "adjective": adjective,
                        "adverb": adverb,
                        "location": location,
                    },
                }
            )
    return all_sentences


def build_grammar() -> dict[str, object]:
    verbs = {}
    for verb in VERBS:
        verbs[verb["infinitive"]] = {
            "en": verb["en"],
            "present": verb["present"],
            "past": verb["past"],
        }
    return {
        "verbs": verbs,
        "articles": {
            "accusative": {"m": "einen", "f": "eine", "n": "ein"},
            "nominative": {"m": "ein", "f": "eine", "n": "ein"},
            "dative": {"m": "einem", "f": "einer", "n": "einem"},
        },
        "adjective_endings": {
            "accusative": {"m": "en", "f": "e", "n": "es"},
            "nominative": {"m": "er", "f": "e", "n": "es"},
            "dative": {"m": "en", "f": "en", "n": "en"},
        },
    }


def build_readings(vocab: list[dict[str, object]]) -> list[dict[str, object]]:
    topics = {
        "history": ["history", "war", "king", "empire", "year"],
        "f1": ["race", "car", "driver", "speed", "team"],
        "aviation": ["plane", "flight", "airport", "pilot", "air"],
        "news": ["news", "report", "government", "world", "today"],
    }

    en_to_de = {}
    for entry in vocab:
        en = entry["en"]
        en_to_de.setdefault(en, []).append(entry)

    readings = []
    rng = random.Random(222)
    for topic, keywords in topics.items():
        candidates = []
        for key in keywords:
            candidates.extend(en_to_de.get(key, []))
        candidates = [c for c in candidates if c.get("pos") == "noun"]
        if not candidates:
            candidates = [v for v in vocab if v.get("pos") == "noun"]
        for i in range(3):
            s1 = rng.choice(candidates)
            s2 = rng.choice(candidates)
            s3 = rng.choice(candidates)
            sentence1 = f"Das {s1['de']} ist wichtig."
            sentence2 = f"Viele Menschen mögen das {s2['de']}."
            sentence3 = f"Wir sprechen heute über das {s3['de']}."
            content = f"{sentence1} {sentence2} {sentence3}"
            options = [f"Das {s2['de']}.", f"Das {s1['de']}.", f"Das {s3['de']}.", "Nichts."]
            rng.shuffle(options)
            correct_index = options.index(f"Das {s2['de']}.")
            readings.append(
                {
                    "id": f"{topic}-{i}",
                    "title": f"Ein Text über {topic}",
                    "content": content,
                    "topic": topic,
                    "questions": [
                        {
                            "question": "Was mögen viele Menschen?",
                            "options": options,
                            "correctIndex": correct_index,
                        }
                    ],
                }
            )
    return readings


def write_json(name: str, data: object) -> None:
    path = OUT_DIR / name
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def write_sharded(name: str, data: list[object], shard_size: int) -> None:
    for index in range(0, len(data), shard_size):
        shard = data[index : index + shard_size]
        path = OUT_DIR / f"{name}-{index // shard_size:04d}.json"
        path.write_text(json.dumps(shard, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--vocab-size", type=int, default=1200)
    parser.add_argument("--sentence-size", type=int, default=600)
    parser.add_argument("--vocab-shard", type=int, default=250)
    parser.add_argument("--sentence-shard", type=int, default=250)
    args = parser.parse_args()

    vocab_size = max(1000, args.vocab_size)
    sentence_size = max(500, args.sentence_size)

    vocab = build_vocabulary(vocab_size)
    grammar = build_grammar()
    sentences = build_sentences(vocab, sentence_size)
    readings = build_readings(vocab)
    write_sharded("vocabulary", vocab, args.vocab_shard)
    write_json("grammar.json", grammar)
    write_sharded("sentences", sentences, args.sentence_shard)
    write_json("readings.json", readings)
    print(f"vocab={len(vocab)} sentences={len(sentences)} readings={len(readings)}")


if __name__ == "__main__":
    main()
