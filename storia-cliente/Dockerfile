# --- ESTÁGIO 1: O Construtor ---
FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_BASE_URL

# 2. Crie um arquivo .env dentro do container usando os argumentos recebidos
RUN echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL}" > .env
RUN echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}" >> .env
RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" >> .env

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# --- ESTÁGIO 2: O Servidor ---
FROM nginx:stable-alpine

# Copia os arquivos de build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]