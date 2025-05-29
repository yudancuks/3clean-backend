# Gunakan image Node.js resmi
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json dulu (untuk caching layer install)
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin seluruh kode ke dalam image
COPY . .

# Expose port
EXPOSE 3000

# Default command: gunakan npm run dev untuk dev, tapi pastikan ini memang benar
CMD ["npm", "run", "dev"]
