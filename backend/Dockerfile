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

RUN g++ -std=c++17 -o web_app web_app.cpp -lpthread

CMD ["./web_app"]
