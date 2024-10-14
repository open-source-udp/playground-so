FROM ubuntu:22.04

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y cmake \
    git \
    build-essential \
    strace \
    libasio-dev && \
    rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/CrowCpp/Crow.git && \
    cd Crow && mkdir build && cd build && \
    cmake .. -DCROW_BUILD_EXAMPLES=OFF -DCROW_BUILD_TESTS=OFF && \
    make install

COPY . .

RUN chmod +x analyze_program.sh
RUN chmod +x parse_strace
RUN g++ -std=c++17 -o web_app web_app.cpp -lpthread
RUN chmod +x web_app
CMD ["./web_app"]
