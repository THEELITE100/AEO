from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
import urllib.parse
import requests
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip().replace('"', '').replace("'", "")

app = FastAPI(title="AEO Multi-Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DiagnosticRequest(BaseModel):
    query: str
    brand: str

# 100% Official, Free Models Hosted Directly on Groq's Enterprise Hardware
ENGINES = [
    {"name": "Llama 3.1 (Meta)", "model_id": "llama-3.1-8b-instant"},
    {"name": "Gemma 2 (Google)", "model_id": "gemma2-9b-it"},
    {"name": "Mixtral (Mistral AI)", "model_id": "mixtral-8x7b-32768"}
]

def scrape_product_image(brand: str, query: str) -> str | None:
    driver = None
    try:
        options = Options()
        options.add_argument("--headless=new")
        
        # --- CRITICAL DOCKER FLAGS FOR RENDER ---
        options.add_argument("--no-sandbox") 
        options.add_argument("--disable-dev-shm-usage") 
        options.add_argument("--disable-gpu")
        options.binary_location = "/usr/bin/google-chrome-stable"
        # ----------------------------------------

        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
        options.add_experimental_option('excludeSwitches', ['enable-logging'])
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)

        search_term = urllib.parse.quote(f"{brand} {query} product high quality")
        driver.get(f"https://www.bing.com/images/search?q={search_term}")

        WebDriverWait(driver, 10).until(lambda d: len(d.find_elements(By.CLASS_NAME, "mimg")) > 0)

        for img in driver.find_elements(By.CLASS_NAME, "mimg"):
            src = img.get_attribute("src") or img.get_attribute("data-src")
            if src and src.startswith("http"):
                return src
        return None
    except Exception as e:
        print(f"Image Scrape Error: {e}")
        return None
    finally:
        if driver:
            driver.quit()

def fetch_real_ai_data(query: str, engine: dict) -> str | None:
    if not GROQ_API_KEY:
        return "⚠️ SETUP REQUIRED: Please add your GROQ_API_KEY to the Render Environment Variables."

    prompt = f"A user is searching for: '{query}'. Write a concise, 1-paragraph recommendation of the best brands. At the very end of your response, on a new line, explicitly write 'BRANDS MENTIONED:' followed by a comma-separated list of the specific brands you just recommended."

    # Groq uses the exact same API format as OpenAI, making integration flawless
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": engine["model_id"],
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        # Groq is insanely fast, so we don't need massive timeout windows
        res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)

        if res.status_code == 200:
            data = res.json()
            if 'choices' in data and len(data['choices']) > 0:
                return data['choices'][0]['message']['content'].strip()
        else:
            print(f"Groq API Error {res.status_code}: {res.text}")
            return None

    except Exception as e:
        print(f"Request Error ({engine['model_id']}): {e}")
        return None

def process_engine_logic(query: str, brand: str, engine: dict):
    raw_answer = fetch_real_ai_data(query, engine)

    if not raw_answer:
        return {
            "engine_name": engine["name"],
            "is_mentioned": False,
            "competitors": "Failed to load",
            "answer": "⚠️ REAL DATA UNAVAILABLE. The API request timed out or was rate-limited."
        }
    
    if "SETUP REQUIRED" in raw_answer:
         return {
            "engine_name": engine["name"],
            "is_mentioned": False,
            "competitors": "Pending Key",
            "answer": raw_answer
        }

    is_mentioned = brand.lower() in raw_answer.lower()
    competitors = "None found"
    clean_answer = raw_answer

    if "BRANDS MENTIONED:" in raw_answer.upper():
        parts = raw_answer.upper().split("BRANDS MENTIONED:")
        comps_string = parts[-1].replace(".", "").replace("*", "").strip()
        clean_answer = raw_answer[:raw_answer.upper().rfind("BRANDS MENTIONED:")].strip()
        comp_list = [c.strip().title() for c in comps_string.split(",") if len(c.strip()) > 1]
        comp_list = [c for c in comp_list if brand.lower() not in c.lower()]
        if comp_list:
            competitors = ", ".join(comp_list)

    return {
        "engine_name": engine["name"],
        "is_mentioned": is_mentioned,
        "competitors": competitors,
        "answer": clean_answer
    }

@app.post("/api/diagnose")
async def run_diagnostic(request: DiagnosticRequest):
    # 1. Start the image scrape
    image_task = asyncio.to_thread(scrape_product_image, request.brand, request.query)

    # 2. FIRE ALL ENGINES CONCURRENTLY! 
    # Because Groq welcomes developers, we don't need to wait or throttle requests.
    engine_tasks = [
        asyncio.to_thread(process_engine_logic, request.query, request.brand, engine)
        for engine in ENGINES
    ]

    # Gather all results instantly
    results = await asyncio.gather(image_task, *engine_tasks)

    image_url = results[0]
    engine_results = list(results[1:])

    # 3. Dynamic Scoring
    successful_engines = [r for r in engine_results if "REAL DATA UNAVAILABLE" not in r["answer"] and "SETUP REQUIRED" not in r["answer"]]
    total_successful = len(successful_engines)

    score = sum(1 for r in successful_engines if r["is_mentioned"])
    win_rate = int((score / total_successful) * 100) if total_successful > 0 else 0

    all_competitors = set()
    for r in successful_engines:
        if r["competitors"] not in ["Failed to load", "None found", "Pending Key"]:
            comps = [c.strip() for c in r["competitors"].split(",")]
            all_competitors.update(comps)

    return {
        "status": "success",
        "image_url": image_url,
        "report_card": {
            "score": score,
            "total_successful": total_successful,
            "win_rate": win_rate,
            "aggregated_competitors": list(all_competitors)[:6]
        },
        "engines": engine_results
    }