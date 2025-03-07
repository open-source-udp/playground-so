import subprocess
import re
import tempfile
import os
from collections import defaultdict
from utils.llm import check_for_forkbomb

def analyze_code(target_executable, working_dir):
    """
    Runs the target executable under strace and parses its log to build a process tree
    including outputs captured via write() syscalls.
    """
    strace_log = os.path.join(working_dir, "strace.log")
    cmd = [
        'strace',
        '-f',                       
        '-e', 'trace=fork,execve,clone,write',
        '-s', '10000',              
        '-o', strace_log,           
        target_executable
    ]
    
    result = subprocess.run(cmd, capture_output=True, cwd=working_dir)
    if result.returncode != 0:
        runtime_error = result.stderr.decode('utf-8')
        raise RuntimeError("Runtime error when executing target executable:\n" + runtime_error)
    
    # Precompile regex patterns for speed.
    pid_regex = re.compile(r'^(\d+)\s+')
    fork_clone_regex = re.compile(r'\b(fork|clone)\b.*=\s*(\d+)\s*$')
    write_regex = re.compile(r'write\(([12]),\s*"((?:\\"|[^"]|\\\n)*?)",')
    
    processes = defaultdict(lambda: {'output': '', 'children': set(), 'parent': None})
    root_pid = None

    with open(strace_log, 'r') as f:
        for line in f:
            pid_match = pid_regex.match(line)
            if not pid_match:
                continue
            current_pid = int(pid_match.group(1))
            if root_pid is None:
                root_pid = current_pid

            fork_clone_match = fork_clone_regex.search(line)
            if fork_clone_match:
                child_pid = int(fork_clone_match.group(2))
                if child_pid > 0:
                    processes[child_pid]['parent'] = current_pid
                    processes[current_pid]['children'].add(child_pid)

            write_match = write_regex.search(line)
            if write_match:
                output = bytes(write_match.group(2), 'utf-8').decode('unicode_escape')
                processes[current_pid]['output'] += output

    def build_tree(pid):
        node = {
            'pid': pid,
            'output': processes[pid]['output'],
            'process': []
        }
        for child in sorted(processes[pid]['children']):
            node['process'].append(build_tree(child))
        return node

    if root_pid is not None:
        return [build_tree(root_pid)]
    else:
        return []

def compile_and_run_codes(codes, fork_b_detect=False):
    """
    Accepts a dictionary of C++ source codes, where each key is the desired filename 
    (e.g. "main.cpp", "a.cpp") and its value is the source code.
    
    If fork_b_detect is True, it first calls the LLM to check for a fork bomb.
    If a fork bomb is detected, a RuntimeError is raised.
    
    Otherwise, it writes each file to a temporary directory, compiles them using g++,
    determines the main executable, runs it under strace, and returns a parsed process tree.
    """

    if fork_b_detect:
        bomb_check = check_for_forkbomb(codes)
        if "fork bomb detected!" in bomb_check.lower():
            raise RuntimeError("Fork bomb detected!")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        executables = {}
        
        for filename, code in codes.items():
            source_path = os.path.join(temp_dir, filename)
            with open(source_path, "w") as f:
                f.write(code)
            
            exe_name = os.path.splitext(filename)[0]
            exe_path = os.path.join(temp_dir, exe_name)
            compile_cmd = ["g++", "-O2", "-std=c++17", source_path, "-o", exe_path]
            compile_process = subprocess.run(compile_cmd, capture_output=True)
            if compile_process.returncode != 0:
                error_msg = compile_process.stderr.decode('utf-8')
                raise RuntimeError(f"Compilation failed for {filename}:\n{error_msg}")
            executables[filename] = exe_path
        
        main_key = None
        if "main.cpp" in codes:
            main_key = "main.cpp"
        elif "main" in codes:
            main_key = "main"
        else:
            for key in codes:
                if "main" in key:
                    main_key = key
                    break
            if main_key is None:
                main_key = list(codes.keys())[0]
        
        main_executable = executables[main_key]
        result = analyze_code(main_executable, working_dir=temp_dir)
        return result