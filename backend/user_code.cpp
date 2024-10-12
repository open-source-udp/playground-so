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

    
    pid_t pid = fork();

    if(pid == me)
    {
        const char* message = "cat";
        
        std::cout << "cat" << std::endl;
    }
    
    for(int i = 0; i < 2; i++)
    {
        pid_t pid = fork();

        if(getpid() == me)
        {
            const char* message = "dog";
            
            std::cout << "dog" << std::endl;
        }
    }
}