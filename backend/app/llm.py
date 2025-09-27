import json
import os
from typing import Dict, Any, Tuple
from openai import OpenAI
from .schemas import GenerateResponse, SectionNotes, QuizItem, MetaInfo


def summarize_and_quiz(text: str) -> Tuple[Dict[str, Any], int, int]:
    """
    Call OpenAI API to generate revision notes and MCQs from text.
    Returns (response_dict, input_tokens, output_tokens)
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    system_prompt = """You are an educational assistant that transforms course text into structured revision notes and valid MCQs. Output MUST follow the provided JSON schema. Use concise French. Avoid hallucinations; if content is too short, say so."""

    user_prompt = f"""Texte de cours (extrait, nettoyé) :
---
{text}
---

Tâches :
1) Crée 3–6 sections de révision. Pour chaque section, renvoie 3–6 bullets synthétiques et spécifiques.
2) Génère exactement 5 QCM. Pour chaque question :
   - 4 propositions distinctes
   - 1 seule bonne réponse
   - "answer_index" = index (0..3) de la bonne réponse
   - Ajoute une explication d'1 phrase.

Réponds EXCLUSIVEMENT en JSON respectant ce schéma :
{{
  "notes":[{{"title":"...","bullets":["...","..."]}}],
  "quiz":[{{"question":"...","choices":["...","...","...","..."],"answer_index":0,"explanation":"..."}}],
  "meta":{{"tokens_input":0,"tokens_output":0,"model":"gpt-4o-mini"}}
}}"""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=4000
        )
        
        content = response.choices[0].message.content.strip()
        
        # Try to parse JSON response
        try:
            response_dict = json.loads(content)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract JSON from the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = content[start_idx:end_idx]
                response_dict = json.loads(json_str)
            else:
                raise ValueError("Could not extract valid JSON from LLM response")
        
        # Validate the response structure
        if not isinstance(response_dict, dict):
            raise ValueError("Response is not a valid JSON object")
            
        if "notes" not in response_dict or "quiz" not in response_dict:
            raise ValueError("Response missing required 'notes' or 'quiz' fields")
        
        # Ensure we have exactly 5 quiz items
        if len(response_dict.get("quiz", [])) != 5:
            raise ValueError("Must have exactly 5 quiz items")
        
        # Ensure each quiz item has exactly 4 choices
        for i, quiz_item in enumerate(response_dict.get("quiz", [])):
            if len(quiz_item.get("choices", [])) != 4:
                raise ValueError(f"Quiz item {i} must have exactly 4 choices")
            if not 0 <= quiz_item.get("answer_index", -1) <= 3:
                raise ValueError(f"Quiz item {i} answer_index must be 0-3")
        
        # Get token usage if available
        input_tokens = response.usage.prompt_tokens if response.usage else 0
        output_tokens = response.usage.completion_tokens if response.usage else 0
        
        # Update meta with actual token counts
        if "meta" not in response_dict:
            response_dict["meta"] = {}
        response_dict["meta"]["tokens_input"] = input_tokens
        response_dict["meta"]["tokens_output"] = output_tokens
        response_dict["meta"]["model"] = model
        
        return response_dict, input_tokens, output_tokens
        
    except Exception as e:
        # Retry once on failure
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,  # Lower temperature for retry
                max_tokens=4000
            )
            
            content = response.choices[0].message.content.strip()
            response_dict = json.loads(content)
            
            input_tokens = response.usage.prompt_tokens if response.usage else 0
            output_tokens = response.usage.completion_tokens if response.usage else 0
            
            if "meta" not in response_dict:
                response_dict["meta"] = {}
            response_dict["meta"]["tokens_input"] = input_tokens
            response_dict["meta"]["tokens_output"] = output_tokens
            response_dict["meta"]["model"] = model
            
            return response_dict, input_tokens, output_tokens
            
        except Exception as retry_error:
            raise ValueError(f"LLM processing failed after retry: {str(retry_error)}")
