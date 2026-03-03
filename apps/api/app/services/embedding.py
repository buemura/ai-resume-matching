import tiktoken
from openai import AsyncOpenAI

from app.config import settings

DEFAULT_MODEL = "text-embedding-3-small"
MAX_TOKENS = 8191  # token limit for text-embedding-3-small


class EmbeddingService:
    def __init__(self, model: str = DEFAULT_MODEL):
        self.model = model
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self._encoding = tiktoken.encoding_for_model(self.model)

    def _token_count(self, text: str) -> int:
        return len(self._encoding.encode(text))

    def _chunk_text(self, text: str) -> list[str]:
        """Split text into chunks that fit within the model's token limit."""
        tokens = self._encoding.encode(text)
        if len(tokens) <= MAX_TOKENS:
            return [text]

        chunks: list[str] = []
        for i in range(0, len(tokens), MAX_TOKENS):
            chunk_tokens = tokens[i : i + MAX_TOKENS]
            chunks.append(self._encoding.decode(chunk_tokens))
        return chunks

    async def get_embedding(self, text: str) -> list[float]:
        """Generate an embedding vector for the given text.

        For long documents that exceed the token limit, the text is split into
        chunks and the resulting embeddings are averaged (weighted by chunk
        token count) to produce a single vector.
        """
        text = text.strip()
        if not text:
            raise ValueError("Cannot generate embedding for empty text")

        chunks = self._chunk_text(text)

        if len(chunks) == 1:
            response = await self.client.embeddings.create(
                input=chunks[0], model=self.model
            )
            return response.data[0].embedding

        # Multiple chunks: compute weighted average of embeddings
        embeddings: list[list[float]] = []
        weights: list[int] = []

        for chunk in chunks:
            response = await self.client.embeddings.create(
                input=chunk, model=self.model
            )
            embeddings.append(response.data[0].embedding)
            weights.append(self._token_count(chunk))

        return self._weighted_average(embeddings, weights)

    @staticmethod
    def _weighted_average(
        embeddings: list[list[float]], weights: list[int]
    ) -> list[float]:
        total_weight = sum(weights)
        dim = len(embeddings[0])
        result = [0.0] * dim
        for emb, w in zip(embeddings, weights):
            for i in range(dim):
                result[i] += emb[i] * w
        for i in range(dim):
            result[i] /= total_weight
        return result
