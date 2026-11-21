FROM node:22-alpine

WORKDIR /app

COPY package*.json yarn.lock* ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3901

CMD ["node", "--watch", "./src/scripts/server.js"]