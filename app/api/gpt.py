import os
from openai import OpenAI
from app.utils.base import abort
from app.models.chat_message import ChatMessage


def gpt_call(user_req: str, chat_messages: list[ChatMessage]) -> str:
    # documents = session.query(Document).filter(Document.folder_id == folder_id).all()

    api_key = os.environ["OPENAI_API_KEY"]
    client = OpenAI(api_key=api_key)

    # prompt
    system_prompt = {
        "role": "system",
        "content": """
            1. You are an AI tutor dedicated to helping;
            students study effectively across various subjects. 
            2. Promote critical thinking by encouraging students to question assumptions;
            evaluate evidence
            3. Respond to students' questions with clear, encouraging; 
            explanations and practical study tips. 
            4. When providing answers, strive to break down complex concepts into manageable 
            steps and offer examples to illustrate your points;
        """,
    }

    chat_completion = []
    chat_completion.append(system_prompt)

    for chat_message in chat_messages:
        role = "user" if chat_message.sender else "assistant"
        content = chat_message.message
        chat_completion.append({"role": role, "content": content})

    chat_completion.append({"role": "user", "content": user_req})

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=chat_completion,
        )
        # TODO: probably handle this differently but just for typing for now
        return completion.choices[0].message.content or ""
    except Exception as e:
        return abort(f"GPT Call Failed: {e}")
