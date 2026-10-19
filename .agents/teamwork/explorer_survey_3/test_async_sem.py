import os
import sys
import asyncio
from dotenv import load_dotenv
from google import genai

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

async def worker(sem, client, item_id):
    async with sem:
        print(f"Starting item {item_id}...")
        try:
            resp = await client.aio.models.generate_content(
                model="gemini-3.8-flash",
                contents=f"Respond with: Done {item_id}"
            )
            res = resp.text.strip()
            print(f"Finished item {item_id}: {res}")
            return item_id, res
        except Exception as e:
            print(f"Failed item {item_id}: {e}")
            return item_id, str(e)

async def main():
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    sem = asyncio.Semaphore(3)
    tasks = [worker(sem, client, i) for i in range(1, 6)]
    results = await asyncio.gather(*tasks)
    print(f"All {len(results)} tasks completed successfully!")

asyncio.run(main())
