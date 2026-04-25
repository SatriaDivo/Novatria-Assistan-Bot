FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY index.js ./
COPY src ./src

USER node

CMD ["npm", "start"]
