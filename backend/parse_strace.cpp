/*
 * Program: Process Tree Builder from strace Output
 * Author: [Your Name]
 *
 * Description:
 * This program reads strace output files, parses them to reconstruct the process tree,
 * and outputs the tree in JSON format. It extracts process creation events (fork, clone, vfork)
 * and collects outputs from write syscalls. The resulting JSON file represents the hierarchy
 * of processes and their outputs, allowing for easy visualization and analysis.
 */

#include <iostream>
#include <fstream>
#include <string>
#include <regex>
#include <unordered_map>
#include <vector>
#include "./include/json.hpp"

using json = nlohmann::json;

struct Process {
    int pid;                    // Process ID
    std::vector<int> children;  // List of child process IDs
    std::string output;         // Collected output from write syscalls
};

/*
 * @param filenames A vector of strace output filenames to parse.
 * @return An unordered_map mapping PIDs to Process structures.
 */
std::unordered_map<int, Process> parse_strace_files(const std::vector<std::string>& filenames) {
    std::unordered_map<int, Process> processes; // Map to store processes by PID
    std::unordered_map<int, int> parent_map;    // Map to track parent-child relationships

    // Regular expression to match fork/clone/vfork syscalls and extract the child PID
    // Example line: clone(...) = 1234
    std::regex fork_regex(R"(.*(clone|fork|vfork)\(.*\)\s+=\s+(\d+))");

    // Regular expression to match write syscalls and extract the written string
    // Example line: write(1, "output", 6) = 6
    std::regex write_regex(R"(.*write\(.*\"(.*)\")");

    // Regular expression to match execve syscalls and extract the executed command
    // Example line: execve("/bin/ls", ["ls"], ...) = 0
    std::regex exec_regex(R"(.*execve\(\"(.*)\",.*)");

    // Iterate over each provided filename
    for (const auto& filename : filenames) {
        std::ifstream file(filename);
        if (!file.is_open()) {
            std::cerr << "Could not open file: " << filename << std::endl;
            continue;
        }

        // Extract the PID from the filename
        int pid = std::stoi(filename.substr(filename.find_last_of('.') + 1));

        // Initialize the Process structure for this PID
        processes[pid] = {pid, {}, ""};

        std::string line;
        // Read the file line by line
        while (std::getline(file, line)) {
            std::smatch match;

            // Check for process creation syscalls
            if (std::regex_search(line, match, fork_regex)) {
                int child_pid = std::stoi(match[2]); // Extract child PID from regex match
                processes[pid].children.push_back(child_pid); // Add child PID to parent's list
                parent_map[child_pid] = pid; // Record the parent of the child PID
            }

            // Check for write syscalls to collect output
            if (std::regex_search(line, match, write_regex)) {
                std::string output = match[1]; // Extract the output string
                processes[pid].output += output; // Append to the existing output
            }

            // Check for execve syscalls to detect a change in the process context
            if (std::regex_search(line, match, exec_regex)) {
                std::string exec_command = match[1]; // Extract the executed command
                processes[pid].output += "\n[Executed: " + exec_command + "]"; // Add exec command to output
            }
        }

        file.close();
    }

    return processes;
}

/**
 * Recursively builds the process tree in JSON format starting from a given PID.
 *
 * @param pid The process ID to start building the tree from.
 * @param processes A map of all processes.
 * @return A JSON object representing the process and its children.
 */
json build_tree(int pid, const std::unordered_map<int, Process>& processes) {
    const Process& proc = processes.at(pid); // Get the Process structure for the PID
    json node; // JSON object to represent the process node
    node["pid"] = proc.pid; // Set the PID in the JSON object

    // If the process has any output collected, add it to the JSON node
    if (!proc.output.empty()) {
        node["output"] = proc.output;
    }

    // If the process has any child processes, recursively build their trees
    if (!proc.children.empty()) {
        node["process"] = json::array(); // Initialize an array to hold child processes
        for (int child_pid : proc.children) {
            // Recursively build the subtree for each child process
            node["process"].push_back(build_tree(child_pid, processes));
        }
    }

    return node; // Return the JSON node representing this process and its subtree
}

int main(int argc, char* argv[]) {
    // Check if at least one strace output file is provided as an argument
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " strace_output.*" << std::endl;
        return 1;
    }

    // Collect all filenames from command line arguments
    std::vector<std::string> filenames(argv + 1, argv + argc);

    // Parse the strace files to build the processes map
    std::unordered_map<int, Process> processes = parse_strace_files(filenames);

    // Identify root processes (processes that are not children of any other process)
    std::vector<int> root_pids;
    for (const auto& [pid, proc] : processes) {
        // Check if the PID is not found in any process's children list
        auto is_child = std::find_if(processes.begin(), processes.end(), [&](const auto& entry) {
            return std::find(entry.second.children.begin(), entry.second.children.end(), pid) != entry.second.children.end();
        });

        if (is_child == processes.end()) {
            root_pids.push_back(pid); // Add PID to the list of root processes
        }
    }

    // Build the process tree starting from each root PID
    json process_tree = json::array(); // JSON array to hold all root process trees
    for (int root_pid : root_pids) {
        // Build and append the tree for each root process
        process_tree.push_back(build_tree(root_pid, processes));
    }

    // Write the process tree to a JSON file with pretty formatting
    std::ofstream output_file("process_tree.json");
    if (!output_file.is_open()) {
        std::cerr << "Could not open output file for writing." << std::endl;
        return 1;
    }
    output_file << std::setw(4) << process_tree << std::endl; // 4 space indentation for pretty printing

    std::cout << "Process tree written to process_tree.json" << std::endl;

    return 0;
}
