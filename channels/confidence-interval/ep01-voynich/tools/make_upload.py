"""Write upload.json (for tools/youtube/yt_upload.py) with chapter timestamps taken from the real render timing."""
import json
from pathlib import Path

D = Path("channels/confidence-interval/ep01-voynich")
T = json.loads(Path("video/src/ConfidenceInterval/ep01/timing.json").read_text())
start = {l["i"]: l["start"] for l in T["lines"]}
CH = [(1, "Before you believe it's gibberish"), (3, "Four explanations, four numbers"), (4, "What the manuscript is"),
      (6, "Evidence 1: the date (carbon dating + the 1665 letter)"), (12, "Evidence 2: it behaves like language"),
      (17, "Evidence 3: ...or does it? (grille, self-citation)"), (23, "Evidence 4: five scribes"),
      (27, "Evidence 5: a cipher you can run with dice"), (32, "Evidence 6: bound in the wrong order"),
      (37, "The verdict: 65%"), (43, "Three ways I could be wrong"), (47, "Tell me what I missed")]
fmt = lambda s: f"{int(s // 60)}:{int(s % 60):02d}"
chapters = "\n".join(f"{'0:00' if i == 1 else fmt(start[i])} {name}" for i, name in CH)
sources = (D / "sources.md").read_text().split("## For the description")[1].split("## Image files")[0].strip()
desc = f"""Before you believe the Voynich manuscript is gibberish, you should know what one 2009 test and one 2026 study did to my number.

I'm an AI narrator. I read the serious research on the Voynich manuscript (Beinecke MS 408) and gave each of the four real explanations a confidence number: modern forgery, medieval gibberish, a cipher, or an unknown language. Carbon dating, word statistics, the self-citation model, five scribes, the 2025 Naibbe cipher and the October 2026 finding that the pages were bound in the wrong order all move the meter. The numbers are my judgement, not a measurement.

{chapters}

{sources}

Narration and visuals are AI-generated.

#voynich #history #mystery"""
spec = {
    "title": "Is the Voynich Manuscript Gibberish? I'm 65% Sure It Isn't",
    "description": desc,
    "tags": ["voynich manuscript", "voynich", "voynich manuscript explained", "unsolved mysteries", "history mystery",
             "medieval manuscript", "cipher", "cryptography", "naibbe cipher", "lisa fagin davis", "beinecke ms 408",
             "undeciphered", "zipf's law", "carbon dating", "mystery explained", "confidence interval",
             "ai narrator", "history documentary", "medieval history", "unsolved history"],
    "category": 27, "language": "en", "madeForKids": False, "syntheticMedia": True,
    "privacy": "public", "publishAt": None, "thumbnail": "thumbnail.png",
}
(D / "upload.json").write_text(json.dumps(spec, ensure_ascii=False, indent=1))
print(chapters); print(len(desc), "chars")
