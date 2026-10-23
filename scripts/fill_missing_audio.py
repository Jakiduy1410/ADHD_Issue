import asyncio
import time
from pathlib import Path
import edge_tts
from generate_audio_assets import AUDIO_ITEMS, VOICE, RATE, PITCH, OUTPUT_DIR

async def fill_missing():
    print("Checking missing audio files...")
    missing = []
    for item in AUDIO_ITEMS:
        cat_dir = OUTPUT_DIR / item["category"]
        out_file = cat_dir / item["file_name"]
        if not out_file.exists() or out_file.stat().st_size < 1000:
            missing.append(item)
    
    print(f"Missing count: {len(missing)} / {len(AUDIO_ITEMS)}")
    if not missing:
        print("All audio files are complete!")
        return

    for idx, item in enumerate(missing, 1):
        cat_dir = OUTPUT_DIR / item["category"]
        cat_dir.mkdir(parents=True, exist_ok=True)
        out_file = cat_dir / item["file_name"]
        key = item["key"]
        print(f"[{idx}/{len(missing)}] Retrying {key}...")
        for attempt in range(4):
            try:
                communicate = edge_tts.Communicate(item["text"], VOICE, rate=RATE, pitch=PITCH)
                await communicate.save(str(out_file))
                if out_file.exists() and out_file.stat().st_size > 1000:
                    print(f"   -> [OK] {item['file_name']} ({out_file.stat().st_size} bytes)")
                    break
            except Exception as e:
                print(f"   -> Attempt {attempt+1} failed: {e}")
                await asyncio.sleep(1.2)
        await asyncio.sleep(0.4)

    # Kiểm tra lại lần cuối
    still_missing = []
    for item in AUDIO_ITEMS:
        out_file = OUTPUT_DIR / item["category"] / item["file_name"]
        if not out_file.exists() or out_file.stat().st_size < 1000:
            still_missing.append(item["key"])

    print(f"\nFinished! Still missing: {len(still_missing)}: {still_missing}")

if __name__ == "__main__":
    asyncio.run(fill_missing())
