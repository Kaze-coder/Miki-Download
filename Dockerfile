FROM node:18-alpine

WORKDIR /app

# Install yt-dlp dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg
RUN pip install yt-dlp

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install --production

# Copy bot files
COPY bot.js .
COPY .env .

# Create downloads directory
RUN mkdir -p downloads

# Run bot
CMD ["npm", "start"]
