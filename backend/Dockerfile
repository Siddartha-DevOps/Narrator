FROM node:20-bullseye-slim AS base

# ffmpeg is required by the render worker for the video pipeline
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM base AS runtime
ENV NODE_ENV=production
EXPOSE 4000

# Default command runs the HTTP API. Override with `npm run start:prod -- worker`
# style command (or a separate service definition) to run the render worker.
CMD ["node", "dist/main.js"]
