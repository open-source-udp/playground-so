from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.llm import analyze_error_helper
from utils.utils import compile_and_run_codes

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/run', methods=['POST'])
def analyze_endpoint():
    """
    API endpoint that accepts a JSON object containing C++ source codes in an array format.
    
    The JSON structure:
    {
      "code": [
        {"filename": "main.cpp", "content": "..."},
        {"filename": "utils.cpp", "content": "..."}
      ],
      "forkBDetect": true,
      "helper": true
    }
    
    - "main.cpp" is always the entry point and must be included.
    - "forkBDetect": If true, checks for fork bombs before execution.
    - "helper": If true, uses an LLM to analyze compilation/runtime errors and suggest fixes.
    """
    data = request.get_json()
    if not data or "code" not in data or not isinstance(data["code"], list):
        return jsonify({"error": "Invalid input: JSON body must contain a 'code' array"}), 400

    forkBDetect = data.get("forkBDetect", False)
    helper_flag = data.get("helper", False)

    code_dict = {entry["filename"]: entry["content"] for entry in data["code"] if "filename" in entry and "content" in entry}

    if "main.cpp" not in code_dict:
        return jsonify({"error": "Missing required file: 'main.cpp'"}), 400

    try:
        result = compile_and_run_codes(code_dict, fork_b_detect=forkBDetect)
        return jsonify(result)
    except Exception as e:
        error_message = str(e)
        if helper_flag:
            try:
                helper_fix = analyze_error_helper(error_message, code_dict)
            except Exception as helper_exception:
                helper_fix = {
                    "analysis": f"Helper analysis failed: {str(helper_exception)}",
                    "solution": "",
                    "correctedCode": ""
                }
            return jsonify({"error": error_message, "helperFix": helper_fix}), 500
        else:
            return jsonify({"error": error_message}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
