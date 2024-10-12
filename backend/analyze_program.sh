#!/bin/bash

# verify if the cpp code is provided as an argument
if [ $# -ne 1 ]; then
    echo "{\"error\": \"Usage: $0 <source_file.cpp>\"}"
    exit 1
fi

SOURCE_FILE=$1
EXECUTABLE="compiled_program"
JSON_OUTPUT="process_tree.json"

# reset files before running the script
cleanup() {
    rm -f strace_output.*
    rm -f $EXECUTABLE
}

trap cleanup EXIT

if [ ! -f "$SOURCE_FILE" ]; then
    echo "{\"error\": \"Source file '$SOURCE_FILE' not found.\"}"
    exit 1
fi

g++ -std=c++17 -o $EXECUTABLE "$SOURCE_FILE"

if [ $? -ne 0 ]; then
    echo "{\"error\": \"Compilation failed.\"}"
    exit 1
fi

# remove the previous JSON output file
rm -f $JSON_OUTPUT

strace -ff -e trace=clone,fork,vfork,write,writev,kill,tgkill,tkill -s 10000 -o strace_output ./$EXECUTABLE

./parse_strace strace_output.*

if [ ! -f "$JSON_OUTPUT" ]; then
    echo "{\"error\": \"JSON output file not found.\"}"
    exit 1
fi

echo "{\"success\": \"JSON file created.\"}"
