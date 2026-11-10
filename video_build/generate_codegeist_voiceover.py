#!/usr/bin/env python3
"""
Generates realistic human voiceover audio for Docarion CareGraph (Atlassian Codegeist 2026)
using Deepgram Aura-2 at 1.0x natural conversational speed (zero artificial speed-up).
Reads scenes and voice selection directly from voiceover_script.json.
"""
import json
import subprocess
import urllib.request
from pathlib import Path

BASE_DIR = Path("/Volumes/External/Hackathons/docarion-forge-clinical-graph/video_build")
OUT_DIR = BASE_DIR / "audio_segments"
OUT_DIR.mkdir(parents=True, exist_ok=True)
SCRIPT_JSON = BASE_DIR / "voiceover_script.json"

def load_deepgram_key() -> str:
    env_path = Path("/Users/gcole/Applications/docarion/backend/.env.local")
    for line in env_path.read_text().splitlines():
        if line.startswith("DEEPGRAM_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("DEEPGRAM_API_KEY not found in backend/.env.local")

def get_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        text=True,
    ).strip()
    return float(out)

def synthesize_deepgram_aura2(text: str, voice_model: str, api_key: str, raw_mp3: Path):
    url = f"https://api.deepgram.com/v1/speak?model={voice_model}&encoding=mp3"
    req = urllib.request.Request(
        url,
        data=json.dumps({"text": text}).encode("utf-8"),
        headers={
            "Authorization": f"Token {api_key}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw_mp3.write_bytes(resp.read())

def main():
    config = json.loads(SCRIPT_JSON.read_text())
    voice_model = config.get("voice_model", "aura-2-odysseus-en")
    scenes = config["scenes"]
    api_key = load_deepgram_key()

    manifest = []
    concat_lines = []
    current_offset = 0.0

    for scene in scenes:
        raw_mp3 = OUT_DIR / f"{scene['id']}_raw.mp3"
        padded_mp3 = OUT_DIR / f"{scene['id']}.mp3"

        synthesize_deepgram_aura2(scene["text"], voice_model, api_key, raw_mp3)

        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(raw_mp3),
                "-af",
                "apad=pad_dur=0.45",
                "-ar",
                "24000",
                "-ac",
                "1",
                "-c:a",
                "libmp3lame",
                "-b:a",
                "192k",
                str(padded_mp3),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        raw_mp3.unlink(missing_ok=True)

        dur = get_duration(padded_mp3)
        manifest.append(
            {
                "id": scene["id"],
                "file": str(padded_mp3),
                "start": round(current_offset, 3),
                "duration": round(dur, 3),
                "end": round(current_offset + dur, 3),
                "text": scene["text"],
            }
        )
        concat_lines.append(f"file '{padded_mp3}'")
        current_offset += dur
        print(f"[{voice_model}] {scene['id']}: {dur:.2f}s (cumulative: {current_offset:.2f}s)")

    concat_txt = BASE_DIR / "concat_audio.txt"
    concat_txt.write_text("\n".join(concat_lines) + "\n")

    full_audio = BASE_DIR / "codegeist_full_narration.mp3"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_txt),
            "-c:a",
            "libmp3lame",
            "-b:a",
            "192k",
            str(full_audio),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    total_dur = get_duration(full_audio)
    manifest_data = {
        "voice": voice_model,
        "total_duration": round(total_dur, 3),
        "scenes": manifest,
    }
    manifest_path = BASE_DIR / "codegeist_narration_manifest.json"
    manifest_path.write_text(json.dumps(manifest_data, indent=2))
    print(f"Done! Full natural human voiceover saved to {full_audio} ({total_dur:.2f}s / {int(total_dur//60):02d}:{int(total_dur%60):02d})")

if __name__ == "__main__":
    main()
