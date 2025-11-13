# Simple Node.js service for staking preview
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY . .
ENV PORT=4010
EXPOSE 4010
CMD ["node", "index.js"]