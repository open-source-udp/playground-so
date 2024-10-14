#include "crow.h"
#include <fstream>
#include <iostream>
#include <cstdlib>
#include "./include/json.hpp"  // For JSON handling

// Function to execute the shell script and generate the JSON file
int run_shell_script(const std::string& file_name) {
    std::string command = "./analyze_program.sh " + file_name;
    return system(command.c_str());  // Executes the shell script
}

class CORS {
public:
    struct context {};

    void before_handle(crow::request& req, crow::response& res, context& ctx) {
        if (req.method == crow::HTTPMethod::Options) {
            res.code = crow::status::OK;
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.end();
        }
    }

    void after_handle(crow::request& req, crow::response& res, context& ctx) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
};

// Function to read the generated JSON file
std::string read_json_file(const std::string& json_file_path) {
    std::ifstream json_file(json_file_path);
    if (!json_file.is_open()) {
        throw std::runtime_error("Could not open JSON file.");
    }

    // Read the file into a string
    std::string json_content((std::istreambuf_iterator<char>(json_file)),
                              std::istreambuf_iterator<char>());

    return json_content;
}

int main() {
    crow::App<CORS> app;

    // POST /run - receives C++ code as text and executes it
    CROW_ROUTE(app, "/Run").methods(crow::HTTPMethod::POST)
    ([&](const crow::request& req) {
        auto code = req.body;

        // Write code to a .cpp file
        std::string file_name = "user_code.cpp";
        std::ofstream out(file_name);
        out << code;
        out.close();

        // Run the shell script that compiles and runs the code
        std::string json_file_path = "process_tree.json";
        try {
            int script_status = run_shell_script(file_name);

            // Check if the shell script was successful
            if (script_status != 0) {
                nlohmann::json error_response;
                error_response["error"] = "Shell script failed.";
                return crow::response(500, error_response.dump());
            }

            // Read the generated JSON file
            std::string json_content = read_json_file(json_file_path);

            // Return the JSON content as a response
            crow::response res{json_content};
            res.set_header("Content-Type", "application/json");
            return res;

        } catch (const std::exception& e) {
            // Return error as JSON
            nlohmann::json error_response;
            error_response["error"] = e.what();
            return crow::response(500, error_response.dump());
        }
    });

    app.port(8080).multithreaded().run();
}