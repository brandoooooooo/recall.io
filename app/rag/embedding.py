import csv
from datetime import datetime
import os
from typing import List, Union
from dotenv import load_dotenv
from openai import OpenAI
from openai.types.embedding_model import EmbeddingModel as EmbeddingModelT
from openai.types.embedding import Embedding

from app.rag.utils import Pool

load_dotenv()


class EmbeddingModel:
    def __init__(
        self, client: OpenAI, model: str | EmbeddingModelT, log_file: str
    ) -> None:
        self.client = client or OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = model or "text-embedding-3-small"
        self.log_file = log_file or "embeddings.csv"

    def _log(self, query_type: str, tokens: int) -> None:
        with open(self.log_file, "a", newline="") as f:
            writer = csv.writer(f)
            now = datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
            # write headers if empty
            if f.tell() == 0:
                writer.writerow(["Timestamp", "Query Type", "Tokens"])
            writer.writerow([now, query_type, tokens])

    async def embed(self, input: str | List[str]) -> List[Embedding]:
        """Create embeds for an input, typically representing a single chunk or multiple chunks"""
        print("started embed request with this many chunks", len(input))
        res = self.client.embeddings.create(input=input, model=self.model)
        print("finished embed")
        if res is None:
            raise Exception("embedding failed")
        self._log("embedding", res.usage.total_tokens)

        return res.data


#
args = {
    "client": OpenAI(api_key=os.getenv("OPENAI_API_KEY")),
    "model": "text-embedding-3-small",
    "log_file": "embeddings.csv",
}
embedding_pool = Pool[EmbeddingModel](EmbeddingModel, args, size=10)


async def embed_chunks(chunks: Union[str, List[str]]) -> List[Embedding]:
    model_instance = embedding_pool.acquire()
    try:
        result = await model_instance.embed(chunks)
    finally:
        embedding_pool.release(model_instance)
    return result


__all__ = ["embed_chunks"]
