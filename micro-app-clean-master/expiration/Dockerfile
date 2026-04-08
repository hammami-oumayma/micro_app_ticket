# Dockerfile pour microservice Payments (TypeScript avec ts-node)

FROM node:20-alpine

# Crée le dossier de travail
WORKDIR /app

# Copie package.json et package-lock.json
COPY package*.json ./

# Installe toutes les dépendances (dev inclues car ts-node est devDependency)
RUN npm install

# Copie tout le code source
COPY . .



# Expose le port du microservice
EXPOSE 3007

# Commande pour lancer le service directement avec ts-node
CMD ["npx", "ts-node", "src/index.ts"]