#!/usr/bin/env python3
"""Upload a finished video to one of our YouTube channels (YouTube Data API v3).

Run this on your own PC: the channel keys (OAuth tokens) stay there, never in the repo or the cloud.

  pip install google-api-python-client google-auth-oauthlib

  # once per channel: opens a browser, you pick the channel and click Allow
  python3 tools/youtube/yt_upload.py auth --channel curious
  python3 tools/youtube/yt_upload.py auth --channel blip

  # upload (private by default; checks everything first with --dry-run)
  python3 tools/youtube/yt_upload.py upload --channel curious --spec channels/curious-minutes/ep03-roman-dodecahedron/upload.json --video cm03-full.mp4 --dry-run
  python3 tools/youtube/yt_upload.py upload --channel curious --spec .../upload.json --video cm03-full.mp4

Files kept OUTSIDE the repo (default folder ~/.yt-upload, change with YT_UPLOAD_HOME):
  client_secret.json       the OAuth client you download from Google Cloud (Desktop app)
  token-<channel>.json     one key per channel, written by `auth`

Spec (upload.json):
  {"title": "...", "description": "...", "tags": ["..."], "category": 28, "language": "en",
   "madeForKids": false, "syntheticMedia": true, "privacy": "private", "publishAt": null,
   "thumbnail": "thumbnail.png"}          # thumbnail path is relative to the spec file
Notes:
  - Until Google audits the API project, videos uploaded through it are locked to private.
  - Each upload costs ~1,600 of the project's 10,000 daily quota units (about 6 uploads a day).
  - Custom thumbnails need a phone-verified channel.
"""
import argparse
import json
import os
import sys
import time
from pathlib import Path

SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"]
CHANNELS = {"curious": "Curious Minutes", "blip": "Blip Check"}
HOME = Path(os.environ.get("YT_UPLOAD_HOME", Path.home() / ".yt-upload"))
CATEGORIES = {27: "Education", 28: "Science & Technology", 22: "People & Blogs", 25: "News & Politics"}


def token_path(channel: str) -> Path:
    return HOME / f"token-{channel}.json"


def credentials(channel: str):
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request

    p = token_path(channel)
    if not p.exists():
        sys.exit(f"No key for '{channel}' yet. Run: yt_upload.py auth --channel {channel}")
    creds = Credentials.from_authorized_user_file(str(p), SCOPES)
    if not creds.valid and creds.refresh_token:
        creds.refresh(Request())
        p.write_text(creds.to_json())
        os.chmod(p, 0o600)
    return creds


def youtube(channel: str):
    from googleapiclient.discovery import build

    return build("youtube", "v3", credentials=credentials(channel), cache_discovery=False)


def my_channel(yt) -> dict:
    r = yt.channels().list(part="snippet", mine=True).execute()
    items = r.get("items", [])
    return items[0] if items else {}


def cmd_auth(a):
    from google_auth_oauthlib.flow import InstalledAppFlow

    secret = HOME / "client_secret.json"
    if not secret.exists():
        sys.exit(f"Put the OAuth client file (Desktop app) at {secret} first. See tools/youtube/README.md.")
    HOME.mkdir(parents=True, exist_ok=True)
    print(f"A browser will open. Sign in and pick the channel '{CHANNELS[a.channel]}', then click Allow.")
    flow = InstalledAppFlow.from_client_secrets_file(str(secret), SCOPES)
    creds = flow.run_local_server(port=0, prompt="consent", access_type="offline")
    p = token_path(a.channel)
    p.write_text(creds.to_json())
    os.chmod(p, 0o600)
    from googleapiclient.discovery import build

    ch = my_channel(build("youtube", "v3", credentials=creds, cache_discovery=False))
    title = ch.get("snippet", {}).get("title", "?")
    print(f"Saved key for '{a.channel}' -> {p}\nThis key uploads to the channel: {title}")
    if title != CHANNELS[a.channel]:
        print(f"WARNING: expected '{CHANNELS[a.channel]}'. If this is the wrong channel, delete {p} and run auth again.")


def load_spec(path: Path) -> dict:
    s = json.loads(path.read_text(encoding="utf-8"))
    errs = []
    if not s.get("title") or len(s["title"]) > 100:
        errs.append("title is required and must be at most 100 characters")
    if len(s.get("description", "").encode("utf-8")) > 5000:
        errs.append("description is over 5,000 bytes")
    if "<" in s.get("description", "") or ">" in s.get("description", ""):
        errs.append("description must not contain < or >")
    if sum(len(t) for t in s.get("tags", [])) > 480:
        errs.append("tags are over ~500 characters in total")
    if s.get("privacy", "private") not in ("private", "unlisted", "public"):
        errs.append("privacy must be private, unlisted or public")
    if s.get("publishAt") and s.get("privacy", "private") != "private":
        errs.append("publishAt (scheduled) needs privacy = private")
    if errs:
        sys.exit("Spec problems:\n- " + "\n- ".join(errs))
    return s


def cmd_upload(a):
    spec_path = Path(a.spec)
    s = load_spec(spec_path)
    video = Path(a.video)
    if not video.exists():
        sys.exit(f"Video not found: {video}")
    thumb = (spec_path.parent / s["thumbnail"]) if s.get("thumbnail") else None
    if thumb and not thumb.exists():
        sys.exit(f"Thumbnail not found: {thumb}")
    body = {
        "snippet": {
            "title": s["title"],
            "description": s.get("description", ""),
            "tags": s.get("tags", []),
            "categoryId": str(s.get("category", 28)),
            "defaultLanguage": s.get("language", "en"),
            "defaultAudioLanguage": s.get("language", "en"),
        },
        "status": {
            "privacyStatus": s.get("privacy", "private"),
            "selfDeclaredMadeForKids": bool(s.get("madeForKids", False)),
            "containsSyntheticMedia": bool(s.get("syntheticMedia", True)),
        },
    }
    if s.get("publishAt"):
        body["status"]["publishAt"] = s["publishAt"]
    mb = video.stat().st_size / 1e6
    print(f"Channel : {CHANNELS[a.channel]} ({a.channel})")
    print(f"Video   : {video} ({mb:.0f} MB)")
    print(f"Title   : {s['title']}")
    print(f"Category: {CATEGORIES.get(int(s.get('category', 28)), s.get('category'))} · privacy {body['status']['privacyStatus']}" + (f" · scheduled {s['publishAt']}" if s.get("publishAt") else ""))
    print(f"Tags    : {len(s.get('tags', []))} · thumbnail: {thumb or 'none'} · synthetic media: {body['status']['containsSyntheticMedia']}")
    if a.dry_run:
        print("Dry run: nothing was uploaded.")
        return

    from googleapiclient.http import MediaFileUpload
    from googleapiclient.errors import HttpError

    yt = youtube(a.channel)
    ch = my_channel(yt).get("snippet", {}).get("title", "?")
    if ch != CHANNELS[a.channel] and not a.yes:
        sys.exit(f"The key for '{a.channel}' belongs to channel '{ch}', not '{CHANNELS[a.channel]}'. Stopping. (--yes to override)")
    req = yt.videos().insert(part="snippet,status", body=body, media_body=MediaFileUpload(str(video), chunksize=8 * 1024 * 1024, resumable=True))
    resp, tries = None, 0
    while resp is None:
        try:
            status, resp = req.next_chunk()
            if status:
                print(f"  uploading… {int(status.progress() * 100)}%", flush=True)
        except HttpError as e:
            if e.resp.status in (500, 502, 503, 504) and tries < 6:
                tries += 1
                time.sleep(2 ** tries)
                continue
            raise
    vid = resp["id"]
    print(f"Uploaded: https://youtu.be/{vid}  (status: {resp['status']['privacyStatus']})")
    if thumb:
        try:
            yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(str(thumb))).execute()
            print("Thumbnail set.")
        except HttpError as e:
            print(f"Thumbnail not set ({e.resp.status}). The channel may need phone verification; set it in YouTube Studio.")
    log = HOME / "uploads.log"
    with log.open("a", encoding="utf-8") as f:
        f.write(json.dumps({"time": time.strftime("%Y-%m-%d %H:%M"), "channel": a.channel, "id": vid, "title": s["title"]}, ensure_ascii=False) + "\n")


def cmd_whoami(a):
    ch = my_channel(youtube(a.channel))
    print(f"'{a.channel}' key -> channel: {ch.get('snippet', {}).get('title', '?')}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ("auth", "whoami"):
        s = sub.add_parser(name)
        s.add_argument("--channel", required=True, choices=CHANNELS)
    u = sub.add_parser("upload")
    u.add_argument("--channel", required=True, choices=CHANNELS)
    u.add_argument("--spec", required=True)
    u.add_argument("--video", required=True)
    u.add_argument("--dry-run", action="store_true")
    u.add_argument("--yes", action="store_true")
    a = p.parse_args()
    {"auth": cmd_auth, "upload": cmd_upload, "whoami": cmd_whoami}[a.cmd](a)


if __name__ == "__main__":
    main()
