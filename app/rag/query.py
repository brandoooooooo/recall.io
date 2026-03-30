import os
from dotenv import load_dotenv
from openai import OpenAI
from app.models.chat import Chat
from app.rag.prompts import (
    BASE_SYSTEM_PROMPT,
    BRAIN_DUMP_SYSTEM_PROMPT,
    QA_SYSTEM_PROMPT,
    QUIZ_SYSTEM_PROMPT,
)
from app.rag.search import search

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# TODO: set to env
MAX_CONTEXT_WINDOW = 50_000


# make refactor this
async def chat_query(query: str, chat: Chat):
    chat_completion = []

    try:
        docs = await search(query, chat)
        print(
            f"search returned {len(docs)} docs for length {sum([len(d.text) for d in docs])}"
        )
    except Exception as e:
        print(e)
        return

    # clamp size of response to MAX_CONTENT_WINDOW length
    context = [{"text": doc.text, "document_id": str(doc.id)} for doc in docs]
    cutoff = []
    cur_context_length = 0
    for source in context:
        # tokenize library would be better
        cur_context_length += len(source["text"])
        if cur_context_length <= MAX_CONTEXT_WINDOW:
            cutoff.append(source)
            continue
        break
    context = cutoff

    # FIXME
    match chat.personality:
        case "qa":
            chat_completion.append({"role": "system", "content": QA_SYSTEM_PROMPT})
        case "braindump":
            chat_completion.append(
                {"role": "system", "content": BRAIN_DUMP_SYSTEM_PROMPT}
            )
        case "quiz":
            chat_completion.append({"role": "system", "content": QUIZ_SYSTEM_PROMPT})
        case _:
            chat_completion.append({"role": "system", "content": BASE_SYSTEM_PROMPT})

    chat_completion.append({"role": "user", "content": f"{context}"})

    # add chat messages
    for chat_message in chat.chat_messages:  # type: ignore
        role = "user" if chat_message.sender else "assistant"
        content = chat_message.message
        chat_completion.append({"role": role, "content": content})

    chat_completion.append({"role": "user", "content": query})

    try:
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=chat_completion,
            # response_format={"type": "json_object"},
        )

        if res is None:
            raise Exception("no response")

        # TODO: probably handle this differently but just for typing for now
        return res.choices[0].message.content or ""
    except Exception as e:
        print(f"GPT Call Failed: {e}")
        raise e
