FROM sdutacm/nodebase:16.15.0

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY .node-version ./
COPY tsconfig.json ./
COPY tsconfig.prod.json ./
COPY src ./src
RUN mv src/config/config.prod.from-file.ts src/config/config.prod.ts
RUN npm i -g nodeinstall
RUN npm ci
# RUN nodeinstall --install-alinode 7.6.0
RUN npm run build

CMD npm run start:foreground
