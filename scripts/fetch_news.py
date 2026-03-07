import json
import logging
import time
import random
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

import feedparser
import trafilatura
from openai import OpenAI
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime
import dateparser
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type
import requests

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants
ROOT_DIR = Path(__file__).resolve().parent.parent
# DATA_DIR = ROOT_DIR / "src" / "data" / "generated" # No longer needed
# READINGS_FILE = DATA_DIR / "readings.json" # No longer needed

# Supabase Configuration
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase URL or Service Role Key not found in environment variables.")
    # You might want to exit here or handle it gracefully, but for now we'll warn.
    # For local dev, we might need to load .env manually if not running via a runner that does it.
    try:
        from dotenv import load_dotenv
        load_dotenv(ROOT_DIR / ".env")
        SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
        SUPABASE_KEY = os.environ.get("VITE_SUPABASE_SERVICE_ROLE_KEY")
    except ImportError:
        pass

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY must be set.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# RSS Feeds Configuration
RSS_FEEDS = {
    "f1": [
        "https://www.motorsport-total.com/rss/formel1.xml",
        "https://www.formel1.de/rss/news.xml"
    ],
    "aviation": [
        "https://www.aero.de/rss.xml",
        "https://www.fliegerweb.com/de/rss/news"
    ],
    "news": [
        "https://rss.dw.com/xml/rss-de-all",
        "https://www.tagesschau.de/xml/rss2"
    ],
    "tech": [
        "https://www.heise.de/rss/heise-atom.xml",
        "https://www.golem.de/rss.php?feed=RSS2.0"
    ]
}

# LLM Configuration (Local Ollama)
CLIENT = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"  # key is required but ignored by Ollama
)
MODEL = "llama3"  # User specified llama3

def check_duplicate_in_db(url: str) -> bool:
    try:
        response = supabase.table("opendeutsch_readings").select("id").eq("source_url", url).execute()
        return len(response.data) > 0
    except Exception as e:
        logger.error(f"Error checking duplicate in DB: {e}")
        return False

def save_reading_to_db(reading: Dict[str, Any]):
    try:
        # 1. Insert Reading
        reading_data = {
            "title": reading["title"],
            "content": reading["content"],
            "topic": reading["topic"],
            "level": reading["level"],
            "source_name": reading["source"]["name"],
            "source_url": reading["source"]["url"],
            "created_at": reading["created_at"],
            "published_at": reading.get("published_at", reading["created_at"])
        }
        
        response = supabase.table("opendeutsch_readings").insert(reading_data).execute()
        if not response.data:
            logger.error("Failed to insert reading.")
            return

        reading_id = response.data[0]["id"]
        
        # 2. Insert Vocabulary
        if reading.get("vocabulary"):
            vocab_data = []
            for v in reading["vocabulary"]:
                vocab_data.append({
                    "reading_id": reading_id,
                    "word": v.get("word", ""),
                    "translation": v.get("translation", ""),
                    "pos": v.get("pos", ""),
                    "definition": v.get("definition", "")
                })
            if vocab_data:
                supabase.table("opendeutsch_reading_vocabulary").insert(vocab_data).execute()
        
        # 3. Insert Questions
        if reading.get("questions"):
                    questions_data = []
                    for q in reading["questions"]:
                        questions_data.append({
                            "reading_id": reading_id,
                            "question": q.get("question", ""),
                            "options": q.get("options", []),
                            "correct_index": q.get("correctIndex", 0),
                            "type": "multiple_choice" # Required field apparently
                        })
                    if questions_data:
                        supabase.table("opendeutsch_reading_questions").insert(questions_data).execute()
                
        logger.info(f"Successfully saved reading {reading['title']} to Supabase.")

    except Exception as e:
        logger.error(f"Error saving reading to DB: {e}")

def fetch_feed_items(topic: str, urls: List[str]) -> List[Dict[str, str]]:
    items = []
    for url in urls:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries:  # Process all entries, filter later
                # Parse date
                published_at = None
                if hasattr(entry, 'published'):
                    published_at = dateparser.parse(entry.published)
                elif hasattr(entry, 'updated'):
                    published_at = dateparser.parse(entry.updated)
                
                # If no date found, use current time
                if not published_at:
                    published_at = datetime.now()

                items.append({
                    "title": entry.title,
                    "link": entry.link,
                    "topic": topic,
                    "source_name": feed.feed.title if 'title' in feed.feed else "Unknown Source",
                    "published_at": published_at
                })
        except Exception as e:
            logger.error(f"Error fetching feed {url}: {e}")
    
    # Sort by published_at descending (newest first)
    items.sort(key=lambda x: x['published_at'] or datetime.min, reverse=True)
    return items

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def extract_article_content(url: str) -> Optional[str]:
    try:
        # Use requests with a timeout to avoid hanging
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        response.raise_for_status()
        
        # Extract content using trafilatura from the HTML
        return trafilatura.extract(response.text)
    except Exception as e:
        logger.warning(f"Error extracting content from {url}: {e}. Retrying...")
        raise e # Re-raise to trigger retry
    return None

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def generate_simplified_content(text: str, level: str, topic: str) -> Optional[Dict[str, Any]]:
    system_prompt = f"""You are an expert German language teacher for A1-B1 students. 
    Your task is to simplify the following news article into a German reading text suitable for level {level}.
    
    Topic: {topic}
    Level: {level}
    
    Constraints for {level}:
    - A1: 120-180 words. Simple sentences (<10 words). Present tense. Basic connectors (und, aber). High-frequency vocabulary.
    - A2: 200-300 words. Sentences <15 words. Perfekt tense allowed. Simple subordinate clauses (weil, dass).
    - B1: 350-500 words. Sentences <20 words. Relative clauses allowed. More complex structure.
    
    Content Requirements:
    - Keep the core information and facts.
    - Explain technical terms simply if needed.
    - Make it coherent and engaging.
    - OUTPUT MUST BE IN GERMAN.
    
    Return ONLY a JSON object with this structure:
    {{
        "title": "Simplified German Title",
        "content": "The simplified German text..."
    }}
    """
    
    try:
        response = CLIENT.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Original Text:\n\n{text[:2000]}"} # Truncate to avoid context limit
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logger.error(f"Error generating content for level {level}: {e}")
        raise e

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def generate_questions_and_vocab(text: str, level: str) -> Optional[Dict[str, Any]]:
    system_prompt = f"""Based on the German text provided, generate comprehension questions and extract difficult vocabulary.
    Target Level: {level}
    
    1. Generate 3-5 multiple choice questions in German.
    2. Extract 5-10 difficult vocabulary words/phrases used in the text.
    
    Return ONLY a JSON object with this structure:
    {{
        "questions": [
            {{
                "question": "German question?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctIndex": 0  # 0-3
            }}
        ],
        "vocabulary": [
            {{
                "word": "German Word",
                "translation": "English Translation",
                "pos": "noun/verb/adj",
                "definition": "Short German definition (optional)"
            }}
        ]
    }}
    """
    
    try:
        response = CLIENT.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Text:\n\n{text}"}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logger.error(f"Error generating questions/vocab: {e}")
        raise e

def main():
    logger.info("Starting Open-Deutsch News Pipeline...")
    
    # existing_readings = load_existing_readings() # No longer needed
    # new_readings = [] # No longer needed
    
    # Process each topic
    for topic, urls in RSS_FEEDS.items():
        logger.info(f"Fetching {topic} feeds...")
        items = fetch_feed_items(topic, urls)
        
        processed_count = 0
        new_added_count = 0
        target_total = 5
        target_new = 2
        
        for item in items:
            # Check stopping conditions
            if processed_count >= target_total and new_added_count >= target_new:
                break
                
            # If we have enough total but not enough new, keep looking for new ones
            # But limit total processing to avoid infinite loops if no new content
            if processed_count >= 15: # Safety break
                logger.info(f"Reached safety limit for {topic}. Processed {processed_count}, Added {new_added_count}.")
                break

            logger.info(f"Processing: {item['title']}")
            
            if check_duplicate_in_db(item['link']):
                logger.info(f"Skipping duplicate in DB: {item['title']}")
                # Duplicates count towards 'processed' (as in 'readings available for this topic')
                # But we really want 5 VALID readings. If they are in DB, they are valid.
                processed_count += 1
                continue

            try:
                content = extract_article_content(item['link'])
            except Exception as e:
                logger.error(f"Failed to download {item['link']} after retries. Skipping.")
                continue

            if not content or len(content) < 500:
                logger.warning(f"Content too short or empty for {item['link']}")
                continue
                
            # Generate Simplified Content (Start with B1 as default, or random?)
            # For now, let's pick a level based on topic or random.
            # Or generate for multiple levels? Let's stick to B1 for now as per previous logic
            # but maybe rotate?
            level = "B1" 
            
            logger.info(f"Simplifying to {level}...")
            try:
                simplified = generate_simplified_content(content, level, topic)
            except Exception as e:
                logger.error(f"Failed to generate simplified content for {item['link']} after retries: {e}")
                continue
            
            if simplified and 'content' in simplified and 'title' in simplified:
                logger.info("Generating questions and vocabulary...")
                try:
                    extras = generate_questions_and_vocab(simplified['content'], level)
                except Exception as e:
                    logger.error(f"Failed to generate questions/vocab for {item['link']} after retries: {e}")
                    continue
                
                if extras:
                    reading_entry = {
                        "title": simplified['title'],
                        "content": simplified['content'],
                        "topic": topic,
                        "level": level,
                        "source": {
                            "name": item['source_name'],
                            "url": item['link']
                        },
                        "created_at": datetime.now().isoformat(),
                        "published_at": item['published_at'].isoformat() if item['published_at'] else datetime.now().isoformat(),
                        "vocabulary": extras.get('vocabulary', []),
                        "questions": extras.get('questions', [])
                    }
                    
                    save_reading_to_db(reading_entry)
                    processed_count += 1
                    new_added_count += 1
                    
        logger.info(f"Finished {topic}: Added {new_added_count} new readings.")
            
    # if new_readings:
    #     all_readings = existing_readings + new_readings
    #     save_readings(all_readings)
    # else:
    #     logger.info("No new readings generated.")

if __name__ == "__main__":
    main()
