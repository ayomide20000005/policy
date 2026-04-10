# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

class GenerateRequest(BaseModel):
    domain: str
    useCase: str
    safetyLevel: str
    model: str

@app.post("/generate")
async def generate(req: GenerateRequest):
    prompt = f"""You are an AI safety architect. Generate a structured reasoning architecture for an AI system.

Domain: {req.domain}
Use Case: {req.useCase}
Safety Level: {req.safetyLevel}
Target Model: {req.model}

Respond ONLY with a JSON object in this exact format, no other text:
{{
  "steps": [
    {{
      "name": "Step name",
      "description": "What this step does",
      "safety_check": true or false
    }}
  ],
  "code": "# Full Python reasoning pipeline code here as a string"
}}

The code should be a complete Python class called ReasoningPipeline with methods for each step, confidence scoring, and safety checkpoints. Make it production ready and well commented. Generate 4-6 steps."""

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "meta/llama-3.1-8b-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 2000
    }

    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(NVIDIA_URL, headers=headers, json=payload)
        data = res.json()

    raw = data["choices"][0]["message"]["content"]
    
    # clean and parse JSON
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    
    result = json.loads(raw)
    return result