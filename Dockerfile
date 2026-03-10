FROM node:20-alpine

WORKDIR /app

# Build client
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client/ ./client/
RUN cd client && npm run build

# Install server deps
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/ ./server/

ENV NODE_ENV=production
ENV DATA_DIR=/data

EXPOSE 3000
ENV PORT=3000

CMD ["node", "--loader", "tsx/esm", "server/src/index.ts"]
