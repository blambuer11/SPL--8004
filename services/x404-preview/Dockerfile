# Simple X404 Preview API
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm i --only=production
COPY index.js ./
RUN mkdir -p data
ENV PORT=4004
EXPOSE 4004
CMD ["node", "index.js"]
