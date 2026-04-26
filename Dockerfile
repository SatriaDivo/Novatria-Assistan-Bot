FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY index.js ./
COPY data ./data
COPY scripts ./scripts
COPY src ./src
RUN mkdir -p data && chown -R node:node /app/data

USER node

CMD ["npm", "start"]
