from openai import AsyncOpenAI

from app.config import settings

PII_MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = """You are a PII removal assistant for bias-reduced resume matching. Given a text (resume or job description), remove all personally identifiable information while preserving professional content.

Remove:
- Names (person names, not company/technology names)
- Age, date of birth
- Gender, pronouns, marital status
- Ethnicity, nationality, race
- Physical descriptions, photo references
- Home address, personal phone, personal email
- Social media profiles (LinkedIn, etc.)
- References to protected characteristics

Keep:
- Skills, technologies, tools
- Work experience descriptions (job titles, responsibilities, achievements)
- Education (degrees, fields of study, certifications — but remove institution names that could reveal demographics)
- Years of experience (as ranges, not exact dates that reveal age)
- Professional certifications and awards

Return ONLY the cleaned text with PII removed. Do not add explanations or markers."""


class PIIStripperService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def strip_pii(self, text: str) -> str:
        text = text.strip()
        if not text:
            return text

        response = await self.client.chat.completions.create(
            model=PII_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
            temperature=0,
        )

        return response.choices[0].message.content or text
