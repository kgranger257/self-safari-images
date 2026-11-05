# Self Safari — auto-populate runbook

Goal: the Instagram/Facebook/Pinterest feed should **never run dry and never repeat**.
A scheduled session runs this procedure. It keeps a healthy backlog of unposted quote
cards in the Google Sheet; the existing Make scenario ("Self Safari — Reflections,
Mon/Wed/Fri 9am") posts one card per run and marks it done.

Everything here is self-contained. Do the steps in order. Do not ask a human — this runs unattended.

## 0. Environment facts
- Repo: `kgranger257/self-safari-images`. Card images live in `reflections/reflection-<N>.jpg`
  and are served to social via jsDelivr from the **main** branch
  (`https://cdn.jsdelivr.net/gh/kgranger257/self-safari-images@main/reflections/reflection-<N>.jpg`).
  **New images and data must be committed to `main`** or posts will 404.
- Google Sheet (via the Make connector): spreadsheet `19mZqtmNhkt4SgZz5a4OCCvdCIIcUR2916in3XT_GYUA`,
  tab `Sheet2`, team `2420052`, org `7989365`, sheets connection `__IMTCONN__` = `9323092`.
- Columns: `A` Post # · `B` Quote (on card) · `C` Author · `D` Source · `E` Caption (what posts) ·
  `F` Instagram hashtags · `G` Card color (name) · `H` Posted/skip marker.
  A row is **unposted/ready** when `B` is non-empty and `H` does NOT contain the word "Posted".
  Leave `H` blank for new rows.
- Rendering: `node tools/render-cards.mjs content/queue.json reflections` (Playwright + bundled
  Chromium; the script already knows the paths). It writes `reflection-<n>.jpg` for each entry.

## 1. Check the backlog
Read `Sheet2`. Count rows where `B` exists and `H` does not contain "Posted".
- If that count is **10 or more**, stop. Nothing to do.
- If it is **fewer than 10**, continue and generate enough new cards to bring the backlog
  to about **18** (so it rarely runs low). Never generate fewer than 10 at a time.

## 2. Write the new cards
Keep the Self Safari voice and this tone mix across the batch (roughly even):
- **Philosophical / resonant** — timeless, a little profound (e.g. Frankl, Jung, Milton).
- **Science / fact** — a real, correctly-attributed research finding (Goleman, Neff, ACE study, affect-labeling).
- **Humor** — genuinely funny, relatable, lands for anyone.
- **Clever & relatable** — sharp, universal; everyone was a kid, everyone is still building EQ.

Rules:
- Theme: emotional intelligence, self-awareness, the inner child, growing up — written so it
  resonates whether or not the reader has kids. Not parenting-only.
- **No repeats.** Check column `B` live AND `content/used-quotes.json`. Skip any quote already present.
- Prefer well-attributed quotes. If attribution is uncertain, either use "Unknown" in `C` with
  "Commonly attributed; author unverified" in `D`, or pick a better-sourced quote. Never invent a quote.
- Caption (`E`): 3 short paragraphs — open with the quote's human truth (light touch welcome),
  give one accurate, sourced research point, close with a `👉` question. Keep research claims real.
- `F`: one topical lead hashtag + the standard set (copy the pattern from existing rows in `content/queue.json`).
- `G`: pick a color NAME and matching hex from the palette below; vary across the batch.

Write the batch to `content/queue.json` as an array of objects with keys:
`n` (next Post #, = max existing A + 1, incrementing), `color` (hex, for rendering), `G` (color name),
`B`, `C`, `D`, `E`, `F`, `H` (""). Match the shape already in that file.

### Palette (name → hex), all legible with white text
charcoal #3a3f4a · slate #4a5560 · indigo #5b6aa6 · dusk #55617f · sky #4d7a95 · teal #2f6e6e ·
forest #3c6150 · moss #5e7154 · plum #6b4668 · wine #7c3b50 · terracotta #b05c3b · clay #9c5a3c ·
honey #b07d2e · ochre #b07d2e

## 3. Render
`node tools/render-cards.mjs content/queue.json reflections` → produces `reflections/reflection-<n>.jpg`.
Spot-check that each expected file was written.

## 4. Commit to main
Commit the new `reflections/reflection-<n>.jpg` files, the updated `content/queue.json`, and the
appended `content/used-quotes.json` to **main**, and push. (Image URLs resolve off `@main`.)

## 5. Add the rows to the sheet
Append one row per new card to `Sheet2` via the Make helper scenario
("Self Safari — Add cards (helper)", team 2420052), passing the rows as input — or, if that
scenario is absent, add rows with a Google Sheets *Add a Row* module mapping A→`n`, B→`B`,
C→`C`, D→`D`, E→`E`, F→`F`, G→`G`, H→"". Confirm each run returns success. Verify the
backlog count is back to ~18.

## 6. Done
Do not post anything yourself — the existing Mon/Wed/Fri scenario does the posting. Stop.
