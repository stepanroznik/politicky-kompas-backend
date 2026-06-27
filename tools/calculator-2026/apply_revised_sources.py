#!/usr/bin/env python3
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
REL_NS = {
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}

EXPECTED_PARTIES = ["ANO", "SPOLU", "STAN", "PIRATI", "SPD", "MOTORISTE", "STACILO"]
EXPECTED_HEADER = [
    "Pořadí",
    "Osa",
    "Kód otázky",
    "Otázka",
    "Strana",
    "Kód strany",
    "Hodnota",
    "Odpověď",
    "Status",
    "Název zdroje",
    "URL",
    "Poznámka",
    "Původní hodnota",
    "Původní odpověď",
    "Síla zdroje",
    "Přesná citace / locator",
    "Ověřeno",
    "Změna",
]


def col_to_idx(ref: str) -> int:
    col = "".join(ch for ch in ref if ch.isalpha())
    value = 0
    for ch in col:
        value = value * 26 + ord(ch.upper()) - 64
    return value


def cell_value(cell, shared):
    cell_type = cell.get("t")
    if cell_type == "inlineStr":
        return "".join(text.text or "" for text in cell.findall(".//m:t", NS))
    value = cell.find("m:v", NS)
    if value is None:
        return ""
    raw = value.text or ""
    if cell_type == "s":
        return shared[int(raw)]
    return raw


def read_shared_strings(archive: ZipFile):
    try:
        root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    except KeyError:
        return []
    return [
        "".join(text.text or "" for text in item.findall(".//m:t", NS))
        for item in root.findall("m:si", NS)
    ]


def read_workbook_sheets(archive: ZipFile):
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    relmap = {
        rel.get("Id"): rel.get("Target")
        for rel in rels.findall("rel:Relationship", REL_NS)
    }
    sheets = {}
    for sheet in workbook.findall("m:sheets/m:sheet", NS):
        target = relmap[sheet.get(f"{{{NS['r']}}}id")]
        sheet_path = target.lstrip("/")
        if not sheet_path.startswith("xl/"):
            sheet_path = "xl/" + sheet_path
        sheets[sheet.get("name")] = sheet_path
    return sheets


def read_sheet(path: Path, sheet_name: str):
    with ZipFile(path) as archive:
        shared = read_shared_strings(archive)
        sheets = read_workbook_sheets(archive)
        if sheet_name not in sheets:
            raise ValueError(f"Sheet {sheet_name!r} was not found. Found: {sorted(sheets)}")
        root = ET.fromstring(archive.read(sheets[sheet_name]))

        rows = []
        for row in root.findall("m:sheetData/m:row", NS):
            values = []
            last_col = 0
            for cell in row.findall("m:c", NS):
                col_idx = col_to_idx(cell.get("r", "A1"))
                while last_col + 1 < col_idx:
                    values.append("")
                    last_col += 1
                values.append(cell_value(cell, shared).strip())
                last_col = col_idx
            rows.append(values)
        return rows


def normalize_rating(value):
    if value in ("", None):
        return None
    if not re.fullmatch(r"\d+(\.0+)?", str(value)):
        raise ValueError(f"Invalid rating value {value!r}")
    rating = int(float(value))
    if rating < 1 or rating > 4:
        raise ValueError(f"Invalid rating value {value!r}")
    return rating


def normalize_int(value, field_name):
    if value in ("", None):
        return None
    if not re.fullmatch(r"\d+(\.0+)?", str(value)):
        raise ValueError(f"Invalid {field_name} value {value!r}")
    return int(float(value))


def normalize_text(value):
    return re.sub(r"\s+", " ", value or "").strip()


def compact_note(note, strength, locator, verified_at):
    parts = []
    if note:
        parts.append(note)
    if strength:
        parts.append(f"Síla zdroje: {strength}")
    if locator:
        parts.append(f"Locator: {locator}")
    if verified_at:
        parts.append(f"Ověřeno: {verified_at}")
    return "\n".join(parts) if parts else None


def load_source_rows(path: Path):
    rows = read_sheet(path, "Zdroje")
    header = rows[0][: len(EXPECTED_HEADER)]
    if header != EXPECTED_HEADER:
        raise ValueError(f"Unexpected Zdroje header:\n{header}")
    entries = []
    for row_number, row in enumerate(rows[1:], start=2):
        if not row or not any(row):
            continue
        padded = row + [""] * (len(EXPECTED_HEADER) - len(row))
        item = dict(zip(EXPECTED_HEADER, padded))
        entries.append(
            {
                "row": row_number,
                "order": normalize_int(item["Pořadí"], "order"),
                "axisName": item["Osa"],
                "questionId": item["Kód otázky"],
                "questionText": normalize_text(item["Otázka"]),
                "partyName": item["Strana"],
                "partyCode": item["Kód strany"],
                "rating": normalize_rating(item["Hodnota"]),
                "answer": item["Odpověď"],
                "evidenceStatus": item["Status"],
                "evidenceTitle": item["Název zdroje"],
                "evidenceUrl": item["URL"],
                "evidenceNote": compact_note(
                    item["Poznámka"],
                    item["Síla zdroje"],
                    item["Přesná citace / locator"],
                    item["Ověřeno"],
                ),
                "sourceStrength": item["Síla zdroje"],
                "sourceLocator": item["Přesná citace / locator"],
                "verifiedAt": item["Ověřeno"],
                "change": item["Změna"],
            }
        )
    return entries


def validate_entries(entries, seed):
    questions = {question["id"]: question for question in seed["questions"]}
    parties = {party["code"]: party for party in seed["parties"]}
    seen = set()
    question_texts = defaultdict(set)
    errors = []

    for entry in entries:
        key = (entry["questionId"], entry["partyCode"])
        if key in seen:
            errors.append(f"Duplicate row for {key} at spreadsheet row {entry['row']}")
        seen.add(key)

        if entry["questionId"] not in questions:
            errors.append(f"Unknown questionId {entry['questionId']!r} at row {entry['row']}")
        if entry["partyCode"] not in parties:
            errors.append(f"Unknown partyCode {entry['partyCode']!r} at row {entry['row']}")
        if entry["partyCode"] not in EXPECTED_PARTIES:
            errors.append(f"Unexpected partyCode {entry['partyCode']!r} at row {entry['row']}")
        if entry["rating"] is None:
            errors.append(f"Missing rating at row {entry['row']}")
        if not entry["evidenceStatus"]:
            errors.append(f"Missing evidence status at row {entry['row']}")
        if not entry["evidenceTitle"]:
            errors.append(f"Missing evidence title at row {entry['row']}")
        if entry["evidenceUrl"] and not entry["evidenceUrl"].startswith(("http://", "https://")):
            errors.append(f"Invalid evidence URL {entry['evidenceUrl']!r} at row {entry['row']}")
        if not entry["evidenceUrl"] and entry["evidenceStatus"] != "assumption":
            errors.append(f"Missing evidence URL at row {entry['row']}")
        if entry["questionText"]:
            question_texts[entry["questionId"]].add(entry["questionText"])

    expected_count = len(seed["questions"]) * len(seed["parties"])
    if len(entries) != expected_count:
        errors.append(f"Expected {expected_count} source rows, got {len(entries)}")
    if len(seen) != expected_count:
        errors.append(f"Expected {expected_count} unique question-party rows, got {len(seen)}")

    for question_id, texts in question_texts.items():
        if len(texts) > 1:
            errors.append(f"Question {question_id} has inconsistent texts: {sorted(texts)}")

    missing_pairs = []
    for question in seed["questions"]:
        for party in seed["parties"]:
            key = (question["id"], party["code"])
            if key not in seen:
                missing_pairs.append(f"{question['id']}:{party['code']}")
    if missing_pairs:
        errors.append(f"Missing pairs: {missing_pairs[:20]}{'...' if len(missing_pairs) > 20 else ''}")

    if errors:
        raise ValueError("\n".join(errors))


def apply_entries(entries, seed, id_changes):
    question_by_id = {question["id"]: question for question in seed["questions"]}
    rating_by_key = {
        (rating["questionId"], rating["partyCode"]): rating
        for rating in seed["ratings"]
    }
    text_changes = []
    rating_changes = []
    status_counter = Counter()

    for entry in entries:
        question = question_by_id[entry["questionId"]]
        if entry["questionText"] and entry["questionText"] != normalize_text(question["text"]):
            text_changes.append(
                {
                    "questionId": entry["questionId"],
                    "old": question["text"],
                    "new": entry["questionText"],
                }
            )
            question["text"] = entry["questionText"]
            question["reviewStatus"] = "source_reviewed"
            question["reviewNote"] = "Question wording checked against the 2026-06-27 revised source spreadsheet."

        rating = rating_by_key[(entry["questionId"], entry["partyCode"])]
        before = {
            "rating": rating["rating"],
            "evidenceStatus": rating["evidenceStatus"],
            "evidenceUrl": rating.get("evidenceUrl"),
            "evidenceTitle": rating.get("evidenceTitle"),
            "evidenceNote": rating.get("evidenceNote"),
        }
        rating["rating"] = entry["rating"]
        rating["evidenceStatus"] = entry["evidenceStatus"]
        rating["evidenceUrl"] = entry["evidenceUrl"] or None
        rating["evidenceTitle"] = entry["evidenceTitle"] or None
        rating["evidenceNote"] = entry["evidenceNote"] or None
        after = {
            "rating": rating["rating"],
            "evidenceStatus": rating["evidenceStatus"],
            "evidenceUrl": rating.get("evidenceUrl"),
            "evidenceTitle": rating.get("evidenceTitle"),
            "evidenceNote": rating.get("evidenceNote"),
        }
        if before != after:
            rating_changes.append(
                {
                    "questionId": entry["questionId"],
                    "partyCode": entry["partyCode"],
                    "before": before,
                    "after": after,
                }
            )
        status_counter[entry["evidenceStatus"]] += 1

    seed["source"] = {
        **seed.get("source", {}),
        "revisedSourceFile": "politicky-kompas-2026-revize-zdroju-oprava-media.xlsx",
        "revisedSourceImportedAt": "2026-06-27",
        "revisedQuestionCount": len(seed["questions"]),
        "revisedRatingCount": len(entries),
        "revisedEvidenceStatuses": dict(sorted(status_counter.items())),
        "revisedTextChangeCount": len(text_changes),
        "revisedRatingOrEvidenceChangeCount": len(rating_changes),
        "normalizedQuestionIds": id_changes,
    }
    return {
        "textChanges": text_changes,
        "ratingChanges": rating_changes,
        "statusCounter": dict(sorted(status_counter.items())),
    }


def normalize_seed_ids(seed):
    id_changes = {}
    seen_ids = set()
    for question in seed["questions"]:
        clean_id = question["id"].strip()
        if clean_id in seen_ids:
            raise ValueError(f"Duplicate question id after trimming: {clean_id}")
        seen_ids.add(clean_id)
        if clean_id != question["id"]:
            id_changes[question["id"]] = clean_id
            question["id"] = clean_id
    for rating in seed["ratings"]:
        clean_id = rating["questionId"].strip()
        if clean_id != rating["questionId"]:
            id_changes[rating["questionId"]] = clean_id
            rating["questionId"] = clean_id
    return id_changes


def main():
    if len(sys.argv) < 2:
        raise SystemExit(
            "Usage: apply_revised_sources.py <politicky-kompas-2026-revize-zdroju-oprava-media.xlsx> [seed.json]"
        )
    spreadsheet_path = Path(sys.argv[1])
    repo_root = Path(__file__).resolve().parents[2]
    seed_path = (
        Path(sys.argv[2])
        if len(sys.argv) > 2
        else repo_root / "apps/api/src/calculator-2026/seed/calculator-2026.seed.json"
    )
    audit_path = seed_path.with_name("calculator-2026.audit.json")

    seed = json.loads(seed_path.read_text(encoding="utf-8"))
    id_changes = normalize_seed_ids(seed)
    entries = load_source_rows(spreadsheet_path)
    validate_entries(entries, seed)
    summary = apply_entries(entries, seed, id_changes)

    seed_path.write_text(
        json.dumps(seed, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    audit = json.loads(audit_path.read_text(encoding="utf-8"))
    audit["sourceReview2026_06_27"] = {
        "sourceFile": spreadsheet_path.name,
        "sourceSheet": "Zdroje",
        "ratingRows": len(entries),
        "textChangeCount": len(summary["textChanges"]),
        "ratingOrEvidenceChangeCount": len(summary["ratingChanges"]),
        "normalizedQuestionIds": id_changes,
        "evidenceStatuses": summary["statusCounter"],
        "valueChanges": [
            change
            for change in summary["ratingChanges"]
            if change["before"]["rating"] != change["after"]["rating"]
        ],
        "methodology": [
            "List Zdroje is the source of truth for ratings and evidence fields.",
            "Question descriptions are preserved from the existing seed because the revised workbook does not contain a description column.",
            "Spreadsheet note, source strength, locator and verification date are combined into evidenceNote so they remain visible without a database schema change.",
        ],
    }
    audit_path.write_text(
        json.dumps(audit, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "rows": len(entries),
                "questions": len(seed["questions"]),
                "parties": len(seed["parties"]),
                "textChanges": len(summary["textChanges"]),
                "ratingOrEvidenceChanges": len(summary["ratingChanges"]),
                "statusCounter": summary["statusCounter"],
                "valueChanges": audit["sourceReview2026_06_27"]["valueChanges"],
                "normalizedQuestionIds": id_changes,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
