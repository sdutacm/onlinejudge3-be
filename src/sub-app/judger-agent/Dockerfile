FROM node:16.15.0

WORKDIR /app

RUN apt-get update && apt-get install -y vim && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY package-lock.json ./
COPY .npmrc ./
COPY .node-version ./
COPY tsconfig.json ./
COPY ecosystem.config.js ./
COPY src ./src
RUN npm i
RUN npm run build

ENV PATH="/app/node_modules/pm2/bin:${PATH}"
CMD npm run start:foreground
