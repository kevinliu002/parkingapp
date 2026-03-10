FROM node:20-alpine

WORKDIR /app

# Build client
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client/ ./client/
RUN cd client && npm run build

# Build server
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/ ./server/
RUN cd server && npx tsc
RUN mkdir -p /data

ENV NODE_ENV=production
ENV DATA_DIR=/data

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server/dist/index.js"]
