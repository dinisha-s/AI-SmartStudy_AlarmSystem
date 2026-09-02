import json
import re
from django.conf import settings

def call_gemini_api(prompt, expected_json=True):
    """
    Orchestrates calls to Google Gemini API using google-genai SDK.
    Includes structured JSON parsing and fallback error handling.
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', '')

    if not api_key or api_key == 'your_gemini_api_key_here':
        # Fallback structured mock if API key is not configured locally
        return None

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )

        raw_text = response.text.strip()

        if expected_json:
            # Clean markdown fences like ```json ... ```
            cleaned_text = re.sub(r'^```json\s*', '', raw_text, flags=re.MULTILINE)
            cleaned_text = re.sub(r'^```\s*', '', cleaned_text, flags=re.MULTILINE)
            cleaned_text = re.sub(r'```$', '', cleaned_text, flags=re.MULTILINE).strip()

            return json.loads(cleaned_text)
        
        return raw_text

    except Exception as e:
        print(f"Gemini API Call Exception: {e}")
        return None
