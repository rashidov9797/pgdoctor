
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Go Backend
FROM golang:1.25-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./

# Copy frontend assets to the specific directory where Go expects them
COPY --from=frontend-builder /app/frontend/dist ./cmd/server/dist

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux go build -o pgdoctor cmd/server/main.go

# Stage 3: Final minimal image
FROM alpine:3.19
WORKDIR /app

COPY --from=backend-builder /app/backend/pgdoctor .

EXPOSE 8080

CMD ["./pgdoctor"]
