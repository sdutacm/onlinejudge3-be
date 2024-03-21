FROM node:16.15.0

RUN apt-get update && apt-get install -y libjemalloc-dev vim && rm -rf /var/lib/apt/lists/*
ENV LD_PRELOAD="/usr/lib/x86_64-linux-gnu/libjemalloc.so"
