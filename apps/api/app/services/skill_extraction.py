import json

from openai import AsyncOpenAI

from app.config import settings

EXTRACTION_MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = """You are a skill extraction assistant. Given a job description or resume text, extract a list of distinct professional skills, technologies, tools, and competencies mentioned.

Rules:
- Return ONLY a JSON object with a single key "skills" containing an array of strings
- Each skill should be concise (1-4 words)
- Normalize skill names (e.g. "JS" → "JavaScript", "k8s" → "Kubernetes")
- Remove duplicates
- Order by relevance/prominence in the text
- Maximum 30 skills

Example output: {"skills": ["Python", "Machine Learning", "Docker", "PostgreSQL"]}"""


class SkillExtractionService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def extract_skills(self, text: str) -> list[str]:
        text = text.strip()
        if not text:
            return []

        response = await self.client.chat.completions.create(
            model=EXTRACTION_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
            response_format={"type": "json_object"},
            temperature=0,
        )

        content = response.choices[0].message.content or "{}"
        data = json.loads(content)
        skills = data.get("skills", [])
        return [s for s in skills if isinstance(s, str)][:30]
