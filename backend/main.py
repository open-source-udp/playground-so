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
    API endpoint that accepts a JSON object containing C++ source codes.
    Each key in the JSON is treated as a filename (e.g., "main.cpp", "a.cpp"),
    and its corresponding value is the source code.
    
    The JSON can include:
      - "forkBDetect": a boolean that, if true, will perform an LLM-based fork bomb check.
      - "helper": a boolean that, if true, will perform an LLM analysis on any error that occurs,
                  returning a concise explanation and suggestion (in JSON format with keys 
                  "analysis", "solution", and "correctedCode").
    
    The API compiles the code, runs it under strace, and returns a JSON tree representing
    the process hierarchy and outputs. In case of an error, if "helper" is true, it will
    also include the suggested fix.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input: JSON body required"}), 400

    original_data = data.copy()
    forkBDetect = data.pop("forkBDetect", False)
    helper_flag = data.pop("helper", False)

    try:
        result = compile_and_run_codes(data, fork_b_detect=forkBDetect)
        return jsonify(result)
    except Exception as e:
        error_message = str(e)
        if helper_flag:
            codes = {k: v for k, v in original_data.items() if k not in ["forkBDetect", "helper"]}
            try:
                helper_fix = analyze_error_helper(error_message, codes)
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
    