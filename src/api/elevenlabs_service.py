"""
Module: ElevenLabs Text-to-Speech Service for Milo Voice Assistant
Tích hợp ElevenLabs SDK để chuyển đổi các kịch bản vi nhiệm vụ & nề nếp sang giọng đọc tự nhiên.
"""

import os
import hashlib
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from elevenlabs import ElevenLabs

# Load biến môi trường từ .env
load_dotenv(".env")

# Thư mục cache file audio sinh ra để tiết kiệm quota ký tự ElevenLabs
CACHE_DIR = Path(__file__).resolve().parents[2] / "data" / "audio_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Voice ID mặc định: Minh Sơn (Anh bạn Milo hoạt hình thân thiện)
DEFAULT_VOICE_ID = "ObhtJZSfI8Ps4i8lwyVx"

def get_elevenlabs_client() -> Optional[ElevenLabs]:
    """Khởi tạo và trả về client ElevenLabs từ biến môi trường ELEVENLABS_API_KEY."""
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        return None
    return ElevenLabs(api_key=api_key)

def text_to_speech_mp3(
    text: str,
    voice_id: str = DEFAULT_VOICE_ID,
    model_id: str = "eleven_multilingual_v2"
) -> bytes:
    """
    Chuyển đổi text tiếng Việt sang dữ liệu bytes audio MP3.
    Có cơ chế cache cục bộ theo hash của nội dung text + voice_id.
    """
    clean_text = text.strip()
    cache_key = hashlib.md5(f"{clean_text}_{voice_id}_{model_id}".encode("utf-8")).hexdigest()
    cache_file = CACHE_DIR / f"{cache_key}.mp3"

    if cache_file.exists():
        with open(cache_file, "rb") as f:
            return f.read()

    client = get_elevenlabs_client()
    if not client:
        raise ValueError("ELEVENLABS_API_KEY chưa được cấu hình trong môi trường!")

    audio_generator = client.text_to_speech.convert(
        text=clean_text,
        voice_id=voice_id,
        model_id=model_id
    )

    audio_bytes = b"".join(audio_generator)

    with open(cache_file, "wb") as f:
        f.write(audio_bytes)

    return audio_bytes
