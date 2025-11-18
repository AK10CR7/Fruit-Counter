# Step 1: Build the Backend (Node.js Express app)
FROM node:18 AS backend
# Set working directory for backend
WORKDIR /app

# Copy backend package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code (server.js)
COPY server.js ./

# Step 2: Build Frontend (Static files)
# We're not building anything in the frontend, just serving index.html, so we can skip build stage

# Step 3: Production Stage (Serving both Backend and Frontend)
FROM node:18 AS app

# Set working directory
WORKDIR /app

# Copy backend code from the backend build stage
COPY --from=backend /app /app

# Install http-server to serve the static files
RUN npm install -g http-server

# Expose ports for backend (4000) and frontend (80)
EXPOSE 4000
EXPOSE 80

# Copy the static index.html file to be served by http-server
COPY index.html /app/index.html

# Step 4: Start both backend and frontend
CMD npm start & http-server /app -p 80

