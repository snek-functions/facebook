# Use Node.js 14 image
FROM node:14-alpine

# Copy all files to /app directory
COPY . /app

# Set working directory
WORKDIR /app

# Install dependencies
RUN npm install

# Set environment variables for access token, blocklist path and page id
ENV ACCESS_TOKEN=YOUR_ACCESS_TOKEN
ENV BLOCKLIST_PATH=path/to/blocklist.parquet
ENV PAGE_ID=YOUR_PAGE_ID

# Mount a volume for blocklist.parquet
VOLUME [ "path/to/blocklist.parquet" ]

# Start the application
CMD ["npm", "start"]

# SPDX-License-Identifier: (EUPL-1.2)
# Copyright © 2019-2022 snek.at