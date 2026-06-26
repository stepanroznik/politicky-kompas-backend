#!/usr/bin/env python3
import json
import re
import sys
from collections import Counter
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

PARTIES = {
    "6_SPD": {"code": "SPD", "name": "Svoboda a přímá demokracie (SPD)"},
    "11_SPOLU": {"code": "SPOLU", "name": "SPOLU: ODS, KDU-ČSL, TOP 09"},
    "16_Pirati": {"code": "PIRATI", "name": "Česká pirátská strana"},
    "20_Motoriste": {"code": "MOTORISTE", "name": "Motoristé sobě"},
    "22_ANO": {"code": "ANO", "name": "ANO 2011"},
    "23_STAN": {"code": "STAN", "name": "Starostové a nezávislí"},
    "25_Stacilo": {"code": "STACILO", "name": "Stačilo!"},
}

AXES = {
    "D1": {
        "code": "geopolitics_nato",
        "name": "Bezpečnost a NATO",
        "negativeLabel": "Izolacionismus",
        "positiveLabel": "Spojenecká bezpečnost",
    },
    "D2": {
        "code": "geopolitics_eu",
        "name": "Evropská integrace",
        "negativeLabel": "Národní suverenita",
        "positiveLabel": "Evropská integrace",
    },
    "D3": {
        "code": "economy_state",
        "name": "Role státu v ekonomice",
        "negativeLabel": "Menší stát",
        "positiveLabel": "Silnější stát",
    },
    "D4": {
        "code": "economy_market",
        "name": "Trh a regulace",
        "negativeLabel": "Volný trh",
        "positiveLabel": "Regulace",
    },
    "D5": {
        "code": "culture_morality",
        "name": "Společenská morálka",
        "negativeLabel": "Konzervativní hodnoty",
        "positiveLabel": "Liberální hodnoty",
    },
    "D6": {
        "code": "culture_identity",
        "name": "Identita a menšiny",
        "negativeLabel": "Národní identita",
        "positiveLabel": "Otevřená společnost",
    },
    "D7": {
        "code": "institutions",
        "name": "Instituce a demokracie",
        "negativeLabel": "Lidová kontrola",
        "positiveLabel": "Institucionální brzdy",
    },
    "D8": {
        "code": "authority_freedom",
        "name": "Autorita a svoboda",
        "negativeLabel": "Státní autorita",
        "positiveLabel": "Občanské svobody",
    },
}


def col_to_idx(ref: str) -> int:
    col = "".join(ch for ch in ref if ch.isalpha())
    value = 0
    for ch in col:
        value = value * 26 + ord(ch.upper()) - 64
    return value


def cell_value(cell, shared):
    cell_type = cell.get("t")
    value = cell.find("m:v", NS)
    if cell_type == "inlineStr":
        return "".join(text.text or "" for text in cell.findall(".//m:t", NS))
    if value is None:
        return None
    raw = value.text
    if cell_type == "s":
        return shared[int(raw)]
    return raw


def read_first_sheet(path: Path):
    with ZipFile(path) as archive:
        shared = []
        try:
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in shared_root.findall("m:si", NS):
                shared.append(
                    "".join(text.text or "" for text in item.findall(".//m:t", NS))
                )
        except KeyError:
            pass

        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        relmap = {
            rel.get("Id"): rel.get("Target")
            for rel in rels.findall("rel:Relationship", REL_NS)
        }
        sheet = workbook.findall("m:sheets/m:sheet", NS)[0]
        target = relmap[sheet.get(f"{{{NS['r']}}}id")]
        sheet_path = "xl/" + target.lstrip("/") if not target.startswith("xl/") else target
        root = ET.fromstring(archive.read(sheet_path))

        rows = []
        for row in root.findall("m:sheetData/m:row", NS):
            values = []
            last_col = 0
            for cell in row.findall("m:c", NS):
                col_idx = col_to_idx(cell.get("r", "A1"))
                while last_col + 1 < col_idx:
                    values.append(None)
                    last_col += 1
                values.append(cell_value(cell, shared))
                last_col = col_idx
            rows.append(values)
        return rows


def normalize_bool(value):
    if value == "TRUE":
        return True
    if value == "FALSE":
        return False
    raise ValueError(f"Invalid reversed value: {value!r}")


def normalize_rating(value):
    if value in (None, ""):
        return None
    rating = int(value)
    if rating < 1 or rating > 4:
        raise ValueError(f"Invalid rating value: {value!r}")
    return rating


def parse_question_id(raw_id: str):
    match = re.match(r"^item_(D\d+)_([0-9.]+)_(.*)$", raw_id)
    if not match:
        raise ValueError(f"Unexpected question id: {raw_id}")
    return {
        "dimensionId": match.group(1),
        "order": float(match.group(2)),
        "facet": match.group(3) or "unclassified",
    }


def build_seed(input_path: Path):
    rows = read_first_sheet(input_path)
    header = rows[0]
    expected_prefix = ["id", "item", "reversed"]
    if header[:3] != expected_prefix:
        raise ValueError(f"Unexpected header prefix: {header[:3]}")

    party_headers = header[3:]
    if party_headers != list(PARTIES.keys()):
        raise ValueError(f"Unexpected party headers: {party_headers}")

    questions = []
    ratings = []
    dimensions = Counter()
    reversed_counter = Counter()

    for index, row in enumerate(rows[1:], start=1):
        if not row or not row[0]:
            continue
        raw_id, original_text, reversed_value = row[:3]
        parsed_id = parse_question_id(raw_id)
        dimension_id = parsed_id["dimensionId"]
        if dimension_id not in AXES:
            raise ValueError(f"Unknown dimension {dimension_id} in {raw_id}")

        reversed_bool = normalize_bool(reversed_value)
        dimensions[dimension_id] += 1
        reversed_counter[reversed_bool] += 1

        question_id = raw_id
        questions.append(
            {
                "id": question_id,
                "axisCode": AXES[dimension_id]["code"],
                "order": index,
                "dimensionOrder": parsed_id["order"],
                "facet": parsed_id["facet"],
                "originalText": original_text,
                "text": original_text,
                "description": None,
                "reversed": reversed_bool,
                "reviewStatus": "needs_review",
                "reviewNote": "Imported from ratings_matrix.xlsx; wording and ratings require source-backed review.",
            }
        )

        for column_index, party_header in enumerate(party_headers, start=3):
            rating = normalize_rating(row[column_index] if len(row) > column_index else None)
            ratings.append(
                {
                    "questionId": question_id,
                    "partyCode": PARTIES[party_header]["code"],
                    "rating": rating,
                    "evidenceStatus": "needs_review" if rating is not None else "missing",
                    "evidenceUrl": None,
                    "evidenceTitle": None,
                    "evidenceNote": "Imported from ratings_matrix.xlsx; verify against official programs/statements."
                    if rating is not None
                    else "No spreadsheet rating supplied.",
                }
            )

    if len(questions) != 120:
        raise ValueError(f"Expected 120 questions, got {len(questions)}")
    if len(dimensions) != 8:
        raise ValueError(f"Expected 8 dimensions, got {len(dimensions)}")
    if reversed_counter[True] != 60 or reversed_counter[False] != 60:
        raise ValueError(f"Expected 60 reversed and 60 normal items, got {reversed_counter}")

    return {
        "calculator": {
            "slug": "2026",
            "name": "Politický kompas 2026",
            "description": "Víceosá politická kalkulačka pro sněmovní volby 2026.",
            "answerScaleMin": 1,
            "answerScaleMax": 4,
        },
        "axes": list(AXES.values()),
        "parties": [dict(value, sourceColumn=key) for key, value in PARTIES.items()],
        "questions": questions,
        "ratings": ratings,
        "source": {
            "file": input_path.name,
            "questionCount": len(questions),
            "ratingCount": len(ratings),
            "dimensions": dict(dimensions),
            "reversed": {
                "true": reversed_counter[True],
                "false": reversed_counter[False],
            },
        },
    }


def apply_curation(seed, curation_path: Path):
    audit = json.loads(curation_path.read_text(encoding="utf-8"))
    questions = {question["id"]: question for question in seed["questions"]}
    ratings = {
        (rating["questionId"], rating["partyCode"]): rating
        for rating in seed["ratings"]
    }

    default_question_note = (
        "Neutrality review pass on 2026-06-15; original wording retained."
    )
    for question in seed["questions"]:
        question["reviewStatus"] = "wording_reviewed"
        question["reviewNote"] = default_question_note

    question_edits = audit.get("questionTextEdits", [])
    for edit in question_edits:
        question_id = edit["questionId"]
        if question_id not in questions:
            raise ValueError(f"Curation references unknown question {question_id}")
        question = questions[question_id]
        question["text"] = edit["text"]
        question["description"] = edit.get("description")
        question["reviewStatus"] = edit.get("status", "neutralized")
        question["reviewNote"] = (
            "Neutrality review pass on 2026-06-15; original wording is "
            "preserved in originalText."
        )

    for rating in seed["ratings"]:
        if rating["rating"] is not None:
            rating["evidenceStatus"] = "spreadsheet_unverified"
            rating["evidenceUrl"] = None
            rating["evidenceTitle"] = None
            rating["evidenceNote"] = (
                "Imported from ratings_matrix.xlsx; treated as an assumed "
                "party answer until verified or corrected by the party."
            )

    seen_overrides = set()
    for override in audit.get("ratingOverrides", []):
        key = (override["questionId"], override["partyCode"])
        if key in seen_overrides:
            raise ValueError(f"Duplicate rating override {key}")
        seen_overrides.add(key)
        if key not in ratings:
            raise ValueError(f"Curation references unknown rating {key}")
        rating_value = override["rating"]
        if rating_value < 1 or rating_value > 4:
            raise ValueError(f"Invalid curated rating {rating_value} for {key}")
        rating = ratings[key]
        rating["rating"] = rating_value
        rating["evidenceStatus"] = override["evidenceStatus"]
        rating["evidenceUrl"] = override.get("evidenceUrl")
        rating["evidenceTitle"] = override.get("evidenceTitle")
        rating["evidenceNote"] = override.get("evidenceNote")

    if audit.get("requireCompleteRatings", True):
        missing = [
            (rating["questionId"], rating["partyCode"])
            for rating in seed["ratings"]
            if rating["rating"] is None
        ]
        if missing:
            raise ValueError(f"Curation left {len(missing)} missing ratings")

    seed.setdefault("source", {})["curation"] = {
        "applied": True,
        "date": audit.get("date"),
        "questionTextEdits": len(question_edits),
        "ratingOverrides": len(audit.get("ratingOverrides", [])),
        "ratingEvidencePolicy": audit.get("ratingEvidencePolicy", {}),
    }
    return seed


def main():
    if len(sys.argv) not in (3, 4):
        print(
            "Usage: import_ratings_matrix.py <ratings_matrix.xlsx> <output.json> [audit.json]",
            file=sys.stderr,
        )
        return 2

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    curation_path = Path(sys.argv[3]) if len(sys.argv) == 4 else None
    seed = build_seed(input_path)
    if curation_path is not None:
        seed = apply_curation(seed, curation_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(seed, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    curation_label = " with curation" if curation_path is not None else ""
    print(
        f"Wrote {len(seed['questions'])} questions and {len(seed['ratings'])} ratings{curation_label} to {output_path}"
    )


if __name__ == "__main__":
    raise SystemExit(main())
