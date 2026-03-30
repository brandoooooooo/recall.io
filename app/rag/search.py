from typing import List

from app.models.chat import Chat
from app.models.collection import Collection
from app.models.collection_source import CollectionSource
from app.models.document import Document
from app.models.document_index import DocumentIndex
from app.rag.embedding import embed_chunks
from app.rag.utils import Pool
from app.utils.base import session, request


class Search:
    def __init__(self, k: int) -> None:
        self.k = k or 10

    async def semantic_search(self, query: str, chat: Chat) -> List[DocumentIndex]:
        """Takes a user's query"""
        res = await embed_chunks(query)
        q_embed = res[0].embedding

        # how to use cosine? with pgvector-python
        valid_doc_ids = session.query(CollectionSource.document_id).where(
            CollectionSource.collection_id == chat.collection_id
        )

        results = (
            session.query(DocumentIndex)
            .join(Document, Document.id == DocumentIndex.document_id)
            .where(Document.user_id == request.user.id, Document.id.in_(valid_doc_ids))
            .order_by(DocumentIndex.embedding.l2_distance(q_embed))
            .limit(self.k)
            .all()
        )

        return results


args = {
    "k": 10,
}
search_pool = Pool[Search](Search, args)


async def search(query: str, chat: Chat) -> List[DocumentIndex]:
    model_instance = search_pool.acquire()
    try:
        result = await model_instance.semantic_search(query, chat)
    finally:
        search_pool.release(model_instance)
    return result


__all__ = ["search"]
