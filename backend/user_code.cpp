#include <iostream>
#include <unistd.h>
#include <sys/shm.h>
#include <sys/ipc.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <cstring>

int main(int argc, char *argv[])
{   
    pid_t me = getpid();

    // shared memory to store the process id
    pid_t pid = fork();

    if(pid == me)
    {
        const char* message = "cat";
        //send(clientSocket, message, strlen(message), 0);
        std::cout << "cat" << std::endl;
    }
    
    for(int i = 0; i < 2; i++)
    {
        pid_t pid = fork();

        if(getpid() == me)
        {
            const char* message = "dog";
            //send(clientSocket, message, strlen(message), 0);
            std::cout << "dog" << std::endl;
        }
    }
}