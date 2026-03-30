import asyncio
from typing import List, Tuple, TypeVar
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai.types.embedding import Embedding
from sqlalchemy import insert

from app.utils.base import session

from app.models.document_index import DocumentIndex
from app.rag.embedding import embed_chunks


# ideally we will remove langchain as a dependency, but this makes development easier for now
def chunk_document(input: str) -> List[str]:
    """Take a text input (representing a document's content) and break it into chunks to be encoded independently"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=80,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_text(input)


def insert_embeds(embeds: List[Tuple[str, Embedding]], document_id: str) -> None:
    """Insert calculated embeddings into the database"""
    # check if document exists in db
    values = []
    print("inserting values")
    for idx, [text, embedding] in enumerate(embeds):
        values.append(
            {
                "text": text,
                "embedding": embedding.embedding,
                "document_id": document_id,
                "position": idx,
            }
        )

    session.execute(insert(DocumentIndex), values)
    session.commit()


T = TypeVar("T", bound=str)


def group_chunks_by_limit(chunks: list[T], limit: int = 500_000) -> list[list[T]]:
    out = []
    group = []
    cur_limit = 0
    for chunk in chunks:
        cur_limit += len(chunk)
        group.append(chunk)

        if cur_limit > limit:
            out.append(group)
            group = []
            cur_limit = 0

    out.append(group)
    return out


async def process_chunk_group(group: list[str], document_id: str):
    embeds = await embed_chunks(group)

    interleaved = [it for it in zip(group, embeds)]
    return interleaved


async def insert_document(content: str, document_id: str) -> None:
    """Takes a document's string representation, chunks it, embeds the chunks, and inserts the results into the db.

    This is the largest unit
    """
    chunks = chunk_document(content)

    chunk_groups = group_chunks_by_limit(chunks)

    all_embeds = await asyncio.gather(
        *(process_chunk_group(group, document_id) for group in chunk_groups)
    )
    flattened_embeds = [embed for group in all_embeds for embed in group]
    insert_embeds(flattened_embeds, document_id)
