# 1. Base image

# docker build -t frontend-image .
# docker run -p 3000:3000 --name frontend-container frontend-image

FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy all files
COPY . .

# 6. Build Next.js app
RUN npm run build

# 7. Expose port
EXPOSE 3000

# 8. Start the app
CMD ["npm", "start"]

# docker build -t frontend .
# docker run -p 3000:3000 frontend