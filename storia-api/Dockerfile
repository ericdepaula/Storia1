# 1. A base da nossa receita: Uma versão específica e estável do Node.js.
FROM node:22-alpine AS build

# 2. Criamos uma "gaveta" dentro da nossa cozinha para guardar as coisas do app.
WORKDIR /src/app

# 3. Copiamos primeiro os arquivos que listam as dependências.
COPY package.json ./

# 4. Instalamos todas as dependências do projeto.
RUN npm install

# 5. Instalamos o PM2 globalmente para manter o app rodando mesmo em caso de erro.
RUN npm install -g pm2

# 6. Agora sim, copiamos todo o resto do nosso código para a "gaveta".
COPY . .

# 7. Avisamos que nosso app vai usar a "saída" 3000.
EXPOSE 3000

# 8. O comando final para ligar o servidor quando o container iniciar usando o PM2.
CMD ["pm2-runtime", "start", "app.js"]
