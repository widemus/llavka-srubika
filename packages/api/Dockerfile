FROM node:18-slim

WORKDIR /usr/src/app

COPY package.json .
COPY packages/api/package.json ./packages/api/

RUN npm install --omit=dev

COPY packages/api/ .

EXPOSE 3001

CMD [ "node", "index.js" ]