# Etapa 1: Compilación de Angular
FROM node:18-alpine AS build
WORKDIR /app

# 1. Copiamos los archivos de configuración de dependencias
COPY package*.json ./

# 2. Copiamos la carpeta de parches (tus librerías modificadas)
COPY patches ./patches

# 3. Instalamos dependencias. 
# El postinstall de tu package.json ejecutará "patch-package" automáticamente
RUN npm install --legacy-peer-deps

# 4. Copiamos el resto del código fuente
COPY . .

# 5. Compilamos con la memoria aumentada (para evitar errores de RAM en Angular)
RUN node --max_old_space_size=4096 node_modules/@angular/cli/bin/ng build --configuration production --output-path=/app/dist/app

# Etapa 2: Servidor Web Nginx
FROM nginx:alpine

# Copiamos tu configuración personalizada de Nginx (si tienes una)
COPY nginx.conf /etc/nginx/nginx.conf

# Copiamos los archivos compilados de Angular al servidor Nginx
COPY --from=build /app/dist/app /usr/share/nginx/html

# Exponemos el puerto 80 interno del contenedor
EXPOSE 80

# Comando para mantener Nginx corriendo
CMD ["nginx", "-g", "daemon off;"]