from langchain_ollama import OllamaLLM
import re
import json


def check_for_forkbomb(codes):
    """
    Uses an Ollama model (via LangChain) to analyze the provided C++ source codes
    for the presence of a fork bomb. The codes are concatenated and sent in a prompt.
    If a fork bomb is detected, the model is expected to output exactly:
       "fork bomb detected!"
    Otherwise, it should output exactly:
       "No fork bomb detected."
    """
    combined_code = "\n".join(codes.values())
    prompt = (
        "Please analyze the following C++ source code for the presence of a fork bomb. "
        "If a fork bomb is detected, output exactly 'fork bomb detected!'. "
        "If no fork bomb is present, output exactly 'No fork bomb detected.'\n\n"
        f"{combined_code}\n"
    )
    llm = OllamaLLM(model="llama3.2:3b")
    response = llm.invoke(prompt)
    return response.strip()

def analyze_error_helper(error_message, codes):
    """
    Uses an Ollama model (via LangChain) to analyze a compilation or runtime error.
    It receives the error message and all source codes, then returns a concise explanation
    and a suggestion for a fix. The LLM is instructed to return its output in JSON format 
    with keys 'analysis', 'solution', and 'correctedCode'. This function extracts the JSON
    block from the response.
    """
    combined_code = "\n".join(codes.values())
    prompt = (
        "You are a concise C++ error fixer. Given an error message and the corresponding C++ source code, "
        "provide a concise explanation of the error and a minimal suggestion to fix it, using as few tokens as possible. "
        "Return the output in JSON format with keys 'analysis', 'solution', and 'correctedCode'. "
        "Ensure that the JSON is valid and does not include any extra text.\n\n"
        "Error:\n" + error_message + "\n\n" +
        "Code:\n" + combined_code + "\n"
    )
    llm = OllamaLLM(model="llama3.2:3b")
    response = llm.invoke(prompt).strip()
    
    start = response.find('{')
    end = response.rfind('}')
    if start != -1 and end != -1:
        json_text = response[start:end+1]
        json_text = re.sub(r'<think>.*?</think>', '', json_text, flags=re.DOTALL).strip()
        try:
            parsed_response = json.loads(json_text)
            return parsed_response
        except json.JSONDecodeError as decode_error:
            pass
    
    match = re.search(r'(\{.*\})', response, re.DOTALL)
    if match:
        json_text = match.group(1)
        json_text = re.sub(r'<think>.*?</think>', '', json_text, flags=re.DOTALL).strip()
        try:
            parsed_response = json.loads(json_text)
            return parsed_response
        except json.JSONDecodeError:
            pass
    
    return {
        "analysis": response,
        "solution": "",
        "correctedCode": ""
    }