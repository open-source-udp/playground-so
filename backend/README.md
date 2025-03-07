
This is the backend API (using Flask) for the playground-so proyect, it receives C++ source code files over HTTP, compiles them, and executes the resulting binary under `strace` to generate a process tree along with captured outputs from write syscalls. In addition, the project integrates LLM-based analysis to (i) detect malicious forking behavior ("fork bomb") and (ii) provide error explanations and suggestions in cases of compile- or runtime errors.

**IMPORTANT**: If you want to run this backend with all the functionalities (the llm implementations) you have to install ollama on your machine, you can see the instalation guide on: [ollama install docs](https://ollama.com/download)

---

# Table of Contents

1. File Structure
2. File Details
   - backend/main.py
   - backend/utils/llm.py
   - backend/utils/utils.py
3. How It Works
4. Usage and Deployment

---

# File Structure

```
playground-so
└── backend
    ├── main.py                # Main API entry point
    └── utils
         ├── llm.py            # LLM integration for error analysis and fork bomb detection
         └── utils.py          # Helper functions to compile, run, and analyze C++ code
```

---

# File Details

## main.py

This file implements the primary Flask application exposing an API endpoint.

- **Endpoint:** run  
  - **Method:** POST  
  - **Input:** A JSON object containing:
    - C++ source codes where keys are filenames (like "main.cpp").
    - Two optional keys:
      - `"forkBDetect"` (boolean): When true, the request triggers a check for fork bombs.
      - `"helper"` (boolean): When true, any error is analyzed via an LLM to provide a concise explanation and suggestion.
  - **Process:**
    1. Validates presence of JSON body.
    2. Separates flags (`forkBDetect` and `helper`) from the actual C++ source code.
    3. Calls `compile_and_run_codes` from utils.py to compile and execute the provided codes.
    4. In case of compilation or runtime errors:
       - If `"helper"` flag is set, calls `analyze_error_helper` from llm.py to generate an explanation, solution, and possibly corrected code.
       - Returns a JSON response with the error and (if available) the helper fix.
- **Example test**  
  ```
  curl -X POST http://localhost:5000/run \
  -H "Content-Type: application/json" \
  -d '{
    "main.cpp": "#include <unistd.h>\n#include <iostream>\n\nusing namespace std;\n\nint main() {\n    pid_t pid = fork();\n    if (pid == 0) {\n        cout << \"Child process\" << endl;\n    } else {\n        cout << \"Parent process\" << endl;\n    }\n    return 0;\n}",
    "forkBDetect": false,
    "helper": false
  }'
  ```

## llm.py

This file provides functionality to leverage an LLM (via LangChain OllamaLLM integration) for two key tasks:

1. **Fork Bomb Detection (`check_for_forkbomb`):**
   - Combines all provided C++ source codes into one.
   - Sends a prompt to the LLM instructing it to check for patterns indicating a fork bomb.
   - Expects the response to be exactly either `"fork bomb detected!"` or `"No fork bomb detected."`.
   
2. **Error Analysis Helper (`analyze_error_helper`):**
   - Combines the C++ source codes and an error message into a prompt.
   - Requests a concise explanation of the error along with a minimal suggestion to fix it.
   - The LLM is expected to output valid JSON with keys: `"analysis"`, `"solution"`, and `"correctedCode"`.
   - If the JSON extraction or parsing fails, the function returns a fallback dictionary containing the raw response.

## utils.py

This file contains essential utility functions:

1. **`analyze_code`:**
   - Runs the compiled executable under `strace` capturing:
     - Process creation (`fork`, `clone`, etc.)
     - `execve` system calls, and
     - `write` syscalls (to capture process outputs)
   - Parses the generated strace log to build a process tree:
     - Uses regex patterns to match PIDs, child processes from fork/clone calls, and outputs.
     - Structures the process tree where each node contains:
       - `pid`: Process ID
       - `output`: Collected output from `write` syscalls.
       - `process`: List of child processes (recursive tree structure).

2. **`compile_and_run_codes`:**
   - If the fork bomb detection flag is enabled, uses `check_for_forkbomb` to preemptively check the code.
   - Writes all C++ source files into a temporary directory.
   - Compiles the code using `g++` and selects the executable that should be run (prefers "main.cpp").
   - Executes the selected executable under strace by calling `analyze_code`.
   - Returns the process tree data.

---

# How It Works

1. **API Call:**
   - The API receives JSON data including C++ source codes plus optional flags.
2. **Compilation and Execution:**
   - Using `compile_and_run_codes`, the code is compiled and the executable is run.
3. **Process Analysis:**
   - `strace` is used to record the process interactions during runtime.
   - A process tree is constructed by linking parent and child PIDs based on system calls.
4. **Error Handling:**
   - If compilation or execution fails, error responses are generated.
   - Optionally, if `"helper"` is set, LLM-based error analysis is performed.
5. **Response:**
   - JSON output includes either the process tree (successful execution) or error details with LLM-supplied fixes.

---

# Usage and Deployment

- **Cloning the repo:**
    On your terminal paste:
    ``` bash
    git clone https://github.com/open-source-udp/playground-so
    ```
- **Running the API:**  
  You can run the Flask app using:
  ```bash
  python playground-so/backend/main.py
  ```
  The app will listen on `0.0.0.0:5000`.

- **Sending a Request:**  
  Use `curl` or any API testing tool (like Postman) to send a POST request to:
  ```
  http://localhost:5000/run
  ```
  with a JSON payload similar to:
  ```json
  {
      "main.cpp": "your C++ code here",
      "forkBDetect": boolean,
      "helper": boolean
  }
  ```
