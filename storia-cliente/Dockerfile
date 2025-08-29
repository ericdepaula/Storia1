# --- ESTÁGIO 1: Base de Desenvolvimento ---
# Esta será a base para o hot-reload
FROM node:22-alpine AS development
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
# A porta que o vite.config.ts usa
EXPOSE 5173
# O comando será sobrescrito pelo docker-compose.override.yml, mas é bom ter um padrão.
CMD ["npm", "run", "dev"]


# --- ESTÁGIO 2: Construtor de Produção ---
# Este estágio só será usado para o deploy final
FROM node:22-alpine AS builder
WORKDIR /app
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_BASE_URL
RUN echo "VITE_SUPABASE_URL=${VITE_SUPABASE_URL}" > .env
RUN echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}" >> .env
RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" >> .env
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build


# --- ESTÁGIO 3: Servidor de Produção ---
# A imagem final e enxuta para a VPS
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]