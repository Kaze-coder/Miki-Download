FROM node:18-slim

WORKDIR /app

# Install yt-dlp dependencies
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip ffmpeg && rm -rf /var/lib/apt/lists/*
RUN pip install --break-system-packages --no-cache-dir yt-dlp

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install --production

# Copy bot files
COPY bot.js .

# Create downloads directory
RUN mkdir -p downloads

# Run bot
CMD ["npm", "start"]
