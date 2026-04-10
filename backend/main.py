# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
import os
import re
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
    steps_prompt = f"""You are an AI safety architect. Generate reasoning steps for an AI system.

Domain: {req.domain}
Use Case: {req.useCase}
Safety Level: {req.safetyLevel}

Respond ONLY with a valid JSON array of 4-6 steps. No other text, no markdown, no code blocks.
Format exactly like this:
[
  {{"name": "Step Name", "description": "What this step does", "safety_check": true}},
  {{"name": "Step Name", "description": "What this step does", "safety_check": false}}
]"""

    code_prompt = f"""You are an AI safety engineer. Write a Python class called ReasoningPipeline for:

Domain: {req.domain}
Use Case: {req.useCase}
Safety Level: {req.safetyLevel}
Target Model: {req.model}

Write a complete, well-commented Python class with methods for each reasoning step, confidence scoring, and safety checkpoints. Return ONLY the Python code, no explanation."""

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=60) as client:
        # Get steps
        steps_res = await client.post(NVIDIA_URL, headers=headers, json={
            "model": "meta/llama-3.1-8b-instruct",
            "messages": [{"role": "user", "content": steps_prompt}],
            "temperature": 0.2,
            "max_tokens": 800
        })
        steps_data = steps_res.json()
        steps_raw = steps_data["choices"][0]["message"]["content"].strip()
        
        # Get code
        code_res = await client.post(NVIDIA_URL, headers=headers, json={
            "model": "meta/llama-3.1-8b-instruct",
            "messages": [{"role": "user", "content": code_prompt}],
            "temperature": 0.2,
            "max_tokens": 1500
        })
        code_data = code_res.json()
        code_raw = code_data["choices"][0]["message"]["content"].strip()

    # Clean steps JSON
    steps_raw = re.sub(r'```json|```', '', steps_raw).strip()
    steps = json.loads(steps_raw)

    # Clean code
    code_raw = re.sub(r'```python|```', '', code_raw).strip()

    return {"steps": steps, "code": code_raw}