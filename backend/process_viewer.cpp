#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <dirent.h>
#include <vector>
#include <unistd.h>
#include <algorithm>
#include <sys/shm.h>
#include <sys/ipc.h>
#include <map>
#include "./include/json.hpp"

/*
Notes: this is not the finally used code, this is just a test code to see if the process tree is being built correctly and
is a test for the json library, the final code is in the parse_strace.cpp file wich is called by the sh script
*/

using json = nlohmann::json;

struct Process 
{
    int pid;
    int ppid;
};

bool getProcessInfo(int pid, Process &process)
{
    // open the stat file for the process located in /proc/<pid>/stat
    std::ifstream statFile("/proc/" + std::to_string(pid) + "/stat");
    if (!statFile.is_open())
    {
        return false;
    }

    // read the first line of the file
    std::string line;
    std::getline(statFile, line);
    statFile.close();
    
    std::istringstream iss(line);
    std::string unused;

    // using iss to parse the single line that contains the process info
    iss >> process.pid >> unused >> unused >> process.ppid;

    return true;
}

std::vector<Process> listProcesses()
{
    std::vector<Process> processes;
    DIR *dir = opendir("/proc");

    // Check if the directory was opened successfully
    if(dir == nullptr)
    {
        std::cerr << "Error opening /proc" << std::endl;
        return processes;
    }

    struct dirent *entry;

    // Iterate over every entry in the directory
    while ((entry = readdir(dir)) != nullptr) {
        if (entry->d_type == DT_DIR) {
            std::string dirName = entry->d_name;
            if (std::all_of(dirName.begin(), dirName.end(), ::isdigit)) {
                Process info;
                if (getProcessInfo(std::stoi(dirName), info)) {
                    processes.push_back(info);
                }
            }
        }
    }

    closedir(dir);
    return processes;
}

// this is the function that prints the procesess jerarchically but is more for a debug purpose
void printProcesses(std::map<int, int> &processMap, int pid, const std::string &prefix, bool isLast)
{
    std::cout << prefix;
    std::cout << (isLast ? "└──" : "├──");
    std::cout << pid << std::endl;

    std::vector<int> children;
    // Search for the children of the process
    for (const auto &proc : processMap) {
        if (proc.second == pid) {
            children.push_back(proc.first);
        }
    }

    // Iterate over every child and recursively call the function
    for (size_t i = 0; i < children.size(); ++i) {
        // If the process is the last one, then the prefix will be different
        std::string newPrefix = prefix + (isLast ? "    " : "│   ");
        bool lastChild = (i == children.size() - 1);
        printProcesses(processMap, children[i], newPrefix, lastChild);
    }
}

// this function builds the json tree
json buildJson(std::map<int, int> &processMap, int pid)
{   
    json Json;
    Json["pid"] = pid;

    std::vector<int> children;
    // Search for the children of the process
    for (const auto &proc : processMap) {
        if (proc.second == pid) {
            children.push_back(proc.first);
        }
    }
    // Recursively build the tree
    if (!children.empty()) {
        Json["process"] = json::array();
        for (int child : children) {
            Json["process"].push_back(buildJson(processMap, child));
        }
    }
    return Json;
}

int main(int argc, char *argv[])
{   
    // Read the parent process ID from shared memory
    key_t key = ftok("shmfile", 65);
    int shmid = shmget(key, 1024, 0666 | IPC_CREAT);
    char* str = (char*)shmat(shmid, (void*)0, 0);

    std::vector<Process> processes = listProcesses();

    // Map of the processes and their parent PIDs
    std::map<int, int> processMap;

    int pid = std::stoi(str);
    
    for (const auto &proc : processes) {
        if(proc.pid == pid)
        {
            // The root process will have a parent PID of 0
            processMap.insert(std::make_pair(proc.pid, 0));
        }
        else if(processMap.find(proc.ppid) != processMap.end())
        {
            processMap.insert(std::make_pair(proc.pid, proc.ppid));
        }
    }


    // Build the JSON tree
    json processJson = buildJson(processMap, pid);
    std::ofstream file("process_tree.json");
    file << processJson.dump(4);
    file.close();

    // Print the process tree
    printProcesses(processMap, pid, "", true);

    // Detach from shared memory
    shmdt(str);
    // Optionally remove the shared memory segment
    shmctl(shmid, IPC_RMID, NULL);

    return 0;
}
