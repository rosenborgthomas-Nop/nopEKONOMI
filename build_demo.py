#!/usr/bin/env python3
"""Generera demo.json enligt demo-budget-prompt.md"""
import json
import copy
import random
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "MSMoney20260831.json"
OUT = ROOT / "demo.json"

START = date(2023, 1, 1)
END = date(2026, 8, 31)


def row(**kw):
    base = {
        "dateOk": True,
        "memo": "",
        "hasSplits": False,
        "splitCount": 0,
        "mismatch": False,
        "splits": [],
    }
    base.update(kw)
    return base


def in_range(iso):
    d = date.fromisoformat(iso)
    return START <= d <= END


def month_iter():
    y, m = START.year, START.month
    while (y, m) <= (END.year, END.month):
        yield y, m
        m += 1
        if m > 12:
            m = 1
            y += 1


def gross_salary(year, month):
    raises = year - 2023
    if month >= 5:
        raises += 1
    return 15000 + raises * 1000


def sundays_in_month(year, month):
    d = date(year, month, 1)
    if month == 12:
        nxt = date(year + 1, 1, 1)
    else:
        nxt = date(year, month + 1, 1)
    out = []
    while d < nxt:
        if d.weekday() == 6:
            out.append(d)
        d += timedelta(days=1)
    return out


def days_in_month(year, month):
    if month == 12:
        nxt = date(year + 1, 1, 1)
    else:
        nxt = date(year, month + 1, 1)
    return (nxt - date(year, month, 1)).days


def gas_days(year, month, rng):
    dim = days_in_month(year, month)
    days = [d for d in range(1, dim + 1) if date(year, month, d).weekday() < 5]
    rng.shuffle(days)
    return sorted(days[:2])


def grocery_amounts(total, rng):
    n = rng.randint(4, 6)
    weights = [rng.random() for _ in range(n)]
    s = sum(weights)
    parts = [max(50, round(total * w / s)) for w in weights]
    diff = total - sum(parts)
    parts[0] += diff
    return parts


def build():
    with open(SRC, encoding="utf-8") as f:
        src = json.load(f)

    el_rows = [
        copy.deepcopy(r)
        for r in src["book"]["accounts"]["Hushållskonto"]["rows"]
        if r.get("category") == "El" and in_range(r["date"])
    ]

    rng = random.Random(42)
    hush = []
    spar = []
    bet = []

    hush.append(row(
        date="2023-01-01", payee="Öppningsbalans", total=5000,
        category="[Hushållskonto]", subCategory="",
    ))
    spar.append(row(
        date="2023-01-01", payee="Öppningsbalans", total=0,
        category="[Spargrisen]", subCategory="",
    ))
    bet.append(row(
        date="2023-01-01", payee="Öppningsbalans", total=0,
        category="[Betalkort]", subCategory="",
    ))

    for year, month in month_iter():
        dim = days_in_month(year, month)
        gross = gross_salary(year, month)
        tax = round(gross * 0.30)
        net = gross - tax
        pay_day = min(27, dim)
        xfer_day = min(28, dim)

        if date(year, month, pay_day) <= END:
            hush.append(row(
                date=f"{year}-{month:02d}-{pay_day:02d}",
                payee="Arbetsgivaren AB",
                total=net,
                category="All Inkomst",
                subCategory="Lön",
                hasSplits=True,
                splitCount=2,
                splits=[
                    {"category": "All Inkomst", "subCategory": "Lön", "memo": "", "total": gross},
                    {"category": "Skatt", "subCategory": "Preliminär skatt", "memo": "", "total": -tax},
                ],
            ))

        ins_day = min(5, dim)
        if date(year, month, ins_day) <= END:
            hush.append(row(
                date=f"{year}-{month:02d}-{ins_day:02d}",
                payee="If Skadeförsäkring",
                total=-500,
                category="Försäkringar",
                subCategory="Bilförsäkring",
            ))

        for d in gas_days(year, month, rng):
            if date(year, month, d) > END:
                continue
            hush.append(row(
                date=f"{year}-{month:02d}-{d:02d}",
                payee="Circle K Bjuv",
                total=-1000,
                category="Transport",
                subCategory="Bil Bränsle",
            ))

        gdays = sorted(rng.sample(range(1, dim + 1), k=min(6, dim)))
        amounts = grocery_amounts(2500, rng)
        for d, amt in zip(gdays[: len(amounts)], amounts):
            if date(year, month, d) > END:
                continue
            hush.append(row(
                date=f"{year}-{month:02d}-{d:02d}",
                payee="Ica Supermarket",
                total=-round(amt, 2),
                category="Mat",
                subCategory="Varuhushandel",
            ))

        pizza_count = rng.choice([1, 2])
        pdays = sorted(rng.sample(range(1, dim + 1), k=min(pizza_count, dim)))
        for d in pdays:
            if date(year, month, d) > END:
                continue
            hush.append(row(
                date=f"{year}-{month:02d}-{d:02d}",
                payee="Amore Pizza Bjuv",
                total=-rng.choice([140, 145, 150]),
                category="Mat",
                subCategory="Äta Ute",
            ))

        for s in sundays_in_month(year, month):
            if s > END or s < START:
                continue
            hush.append(row(
                date=s.isoformat(),
                payee="Coolbet.com",
                total=-250,
                category="Nöje",
                subCategory="Hasardspel",
            ))

        if date(year, month, xfer_day) <= END:
            hush.append(row(
                date=f"{year}-{month:02d}-{xfer_day:02d}",
                payee="ÖVF Spargrisen",
                total=-1000,
                category="[Spargrisen]",
                subCategory="",
            ))
            spar.append(row(
                date=f"{year}-{month:02d}-{xfer_day:02d}",
                payee="ÖVF Hushållskonto",
                total=1000,
                category="[Hushållskonto]",
                subCategory="",
            ))

    hush.extend(el_rows)

    def sort_rows(rows):
        return sorted(rows, key=lambda r: (r["date"], r.get("payee", "")))

    def finalize(rows):
        rows = sort_rows(rows)
        return {
            "filename": "",
            "rows": rows,
            "badDateCount": 0,
            "mismatchCount": 0,
        }

    book = {
        "order": ["Betalkort", "Hushållskonto", "Spargrisen"],
        "accounts": {
            "Betalkort": finalize(bet),
            "Hushållskonto": finalize(hush),
            "Spargrisen": finalize(spar),
        },
        "payeeList": [],
        "categoryList": [],
        "subCategoryList": [],
    }

    demo = {
        "format": "hemekonomi-book",
        "version": 1,
        "name": "demo",
        "savedAt": int(__import__("time").time() * 1000),
        "book": book,
    }

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(demo, f, ensure_ascii=False, indent=2)

    print(f"Skrev {OUT}")
    print(f"  Hushållskonto: {len(hush)} rader")
    print(f"  Spargrisen: {len(spar)} rader")
    print(f"  El kopierade: {len(el_rows)} rader")


if __name__ == "__main__":
    build()
