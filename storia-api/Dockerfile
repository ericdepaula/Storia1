# --- ESTÁGIO 1: Base ---
# Esta base será compartilhada entre dev e produção para aproveitar o cache
FROM node:22-alpine AS base
WORKDIR /src/app
# Copia os arquivos de dependência primeiro
COPY package.json ./

# --- ESTÁGIO 2: Desenvolvimento ---
# Este estágio será usado quando você rodar `docker-compose up` com o arquivo de override
FROM base AS development
# Instala TODAS as dependências, incluindo as de desenvolvimento (ex: nodemon)
RUN npm install
COPY . .
# O comando será definido no docker-compose.override.yml para hot-reload
CMD ["npm", "run", "dev"]


# --- ESTÁGIO 3: Produção ---
# Este estágio será usado para a build final de produção
FROM base AS production
# Instala APENAS as dependências de produção para uma imagem mais leve
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npx", "pm2-runtime", "start", "app.js"]