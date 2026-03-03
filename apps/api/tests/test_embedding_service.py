"""Unit tests for the EmbeddingService (OpenAI calls are mocked)."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.embedding import EmbeddingService


@pytest.fixture
def fake_openai_response():
    """Helper to create a mock OpenAI embeddings response."""

    def _make(embedding: list[float]):
        data_item = MagicMock()
        data_item.embedding = embedding
        response = MagicMock()
        response.data = [data_item]
        return response

    return _make


@pytest.fixture
def service():
    with patch("app.services.embedding.settings") as mock_settings:
        mock_settings.openai_api_key = "test-key"
        svc = EmbeddingService()
        yield svc


class TestTokenCount:
    def test_counts_tokens(self, service):
        count = service._token_count("hello world")
        assert isinstance(count, int)
        assert count > 0

    def test_empty_string(self, service):
        count = service._token_count("")
        assert count == 0


class TestChunkText:
    def test_short_text_returns_single_chunk(self, service):
        chunks = service._chunk_text("short text")
        assert len(chunks) == 1
        assert chunks[0] == "short text"

    def test_long_text_returns_multiple_chunks(self, service):
        # Create text that exceeds the token limit
        long_text = "word " * 20000
        chunks = service._chunk_text(long_text)
        assert len(chunks) > 1


class TestGetEmbedding:
    @pytest.mark.asyncio
    async def test_single_chunk_embedding(self, service, fake_openai_response):
        expected = [0.1] * 1536
        service.client.embeddings.create = AsyncMock(
            return_value=fake_openai_response(expected)
        )

        result = await service.get_embedding("short text")
        assert result == expected
        service.client.embeddings.create.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_empty_text_raises_error(self, service):
        with pytest.raises(ValueError, match="empty text"):
            await service.get_embedding("")

    @pytest.mark.asyncio
    async def test_whitespace_only_raises_error(self, service):
        with pytest.raises(ValueError, match="empty text"):
            await service.get_embedding("   ")

    @pytest.mark.asyncio
    async def test_multi_chunk_embedding(self, service, fake_openai_response):
        emb1 = [1.0] * 4
        emb2 = [3.0] * 4

        service.client.embeddings.create = AsyncMock(
            side_effect=[
                fake_openai_response(emb1),
                fake_openai_response(emb2),
            ]
        )
        # Force multiple chunks
        service._chunk_text = MagicMock(return_value=["chunk1", "chunk2"])
        service._token_count = MagicMock(side_effect=[5, 5])

        result = await service.get_embedding("some long text")
        assert len(result) == 4
        # Weighted average of [1,1,1,1] (weight=5) and [3,3,3,3] (weight=5) = [2,2,2,2]
        assert all(abs(v - 2.0) < 1e-9 for v in result)


class TestWeightedAverage:
    def test_equal_weights(self):
        embeddings = [[1.0, 2.0], [3.0, 4.0]]
        weights = [1, 1]
        result = EmbeddingService._weighted_average(embeddings, weights)
        assert result == [2.0, 3.0]

    def test_unequal_weights(self):
        embeddings = [[0.0, 0.0], [10.0, 10.0]]
        weights = [1, 3]
        result = EmbeddingService._weighted_average(embeddings, weights)
        assert result == [7.5, 7.5]

    def test_single_embedding(self):
        embeddings = [[5.0, 10.0]]
        weights = [1]
        result = EmbeddingService._weighted_average(embeddings, weights)
        assert result == [5.0, 10.0]
