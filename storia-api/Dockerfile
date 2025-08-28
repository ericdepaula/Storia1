FROM node:22-alpine AS build

WORKDIR /src/app
COPY package.json ./

RUN npm install
RUN npm install -g pm2

COPY . .

EXPOSE 3000

CMD ["pm2-runtime", "start", "app.js"]