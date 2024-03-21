FROM sdutacm/nodebase:16.15.0

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY .npmrc ./
COPY .node-version ./
COPY tsconfig.json ./
COPY ecosystem.config.js ./
COPY ecosystem-dm.config.js ./
COPY src ./src
RUN npm i
RUN npm run build

ENV PATH="/app/node_modules/pm2/bin:${PATH}"
CMD npm run start:foreground
