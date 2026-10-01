FROM node:22-trixie-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node config ./config
COPY --chown=node:node routes ./routes
COPY --chown=node:node utils ./utils
COPY --chown=node:node public ./public
COPY --chown=node:node server.js ./server.js

RUN mkdir -p /app/data && chown node:node /app/data
USER node

EXPOSE 3001
CMD ["npm", "start"]