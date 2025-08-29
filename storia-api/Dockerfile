# --- ESTÁGIO 1: Base ---
# Esta base será compartilhada entre dev e produção para aproveitar o cache
FROM node:22-alpine AS base
WORKDIR /src/app
COPY package.json package-lock.json* ./

# --- ESTÁGIO 2: Desenvolvimento ---
# Usado pelo docker-compose.override.yml
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# --- ESTÁGIO 3: Produção ---
# Usado pelo docker-compose.yml para a build final
FROM base AS production
# Instala APENAS as dependências de produção
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npx", "pm2-runtime", "start", "app.js"]