from openai import OpenAI
from config import settings

client = OpenAI(api_key=settings.openai_api_key)


def extract_important_information(text):

    prompt = f"""
    Extract the most important information from the following document.

    Provide:
    - Key points
    - Important dates
    - Important names
    - Important numbers
    - Summary

    Document:
    {text[:8000]}
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content
