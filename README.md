# 🚀 ShopFusion - Dockerized Hybrid Retail Analytics & Recommendation System

![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)
![FastAPI](https://img.shields.io/badge/ML-FastAPI-009688?logo=fastapi)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-green)

## 📖 Overview

**ShopFusion** is a full-stack **Hybrid Retail Analytics & Product Recommendation System** designed to help retailers efficiently manage products, analyze customer purchasing behavior, and generate intelligent product recommendations using Machine Learning.

The application is fully **Dockerized** using a **Microservices Architecture** with **Multi-Stage Docker Builds**, enabling easy deployment, scalability, and consistent development across different environments.

---

# ✨ Features

- 📦 Unlimited Product & Transaction Import System
- 🤖 Hybrid Recommendation Engine
- 🛒 Market Basket Analysis
- 📊 Retail Analytics Dashboard
- 📈 Inventory & Product Management
- 👥 Customer Management
- 🔐 JWT Authentication
- ⚡ High Performance REST APIs
- 🐳 Fully Dockerized Microservices
- 🚀 Multi-Stage Docker Builds

---

# 🏗️ System Architecture

```
                   Browser
                      │
                      ▼
          React Frontend (Nginx)
                 Port 3000
                      │
                      ▼
          Node.js + Express API
                 Port 5000
             │                │
             ▼                ▼
      MongoDB Atlas     FastAPI ML Engine
                             Port 8000
```

---

# 📂 Project Structure

```
ShopFusion
│
├── frontend
│   ├── src
│   ├── public
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── scripts
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
│
├── ml-engine
│   ├── algorithms
│   ├── api
│   ├── data
│   ├── fusion
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
│
├── docker-compose.yml
├── README.md
├── products_dataset.xlsx
└── transactions_dataset.xlsx
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- Axios

## Backend

- Node.js
- Express.js
- JWT Authentication
- Mongoose
- REST APIs

## Machine Learning

- Python
- FastAPI
- Pandas
- NumPy
- Scikit-learn
- MLxtend

## Database

- MongoDB Atlas

## DevOps

- Docker
- Docker Compose
- Nginx
- Multi-Stage Docker Builds
- Bridge Networking

---

# 🐳 Docker Architecture

| Service | Technology | Docker |
|----------|------------|--------|
| Frontend | React + Nginx | ✅ Multi-Stage |
| Backend | Node.js + Express | ✅ Dockerized |
| ML Engine | Python + FastAPI | ✅ Multi-Stage |
| Database | MongoDB Atlas | Cloud Database |

---

# 🚀 Multi-Stage Docker Builds

## Frontend

- Node.js Builder Image
- Production Build using Vite
- Nginx Runtime Image
- Lightweight Production Container

---

## Backend

- Node.js Runtime
- Production Dependencies
- Environment Variables
- REST API Service

---

## ML Engine

- Python Builder Stage
- Dependency Installation
- FastAPI Runtime
- Optimized Production Image

---

# 🌐 Services

| Service | Port |
|----------|------|
| Frontend | 3000 |
| Backend API | 5000 |
| FastAPI ML Engine | 8000 |

---

# ⚙️ Environment Variables

## Frontend

```env
VITE_API_URL=http://localhost:5000
```

---

## Backend

```env
NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
JWT_EXPIRE=30d

MIN_SUPPORT=0.01
MIN_CONFIDENCE=0.3
MIN_LIFT=1.0

PYTHON_API_URL=http://ml-engine:8000
USE_PYTHON_ENGINE=false

CLIENT_URL=http://localhost:3000
```

---

## ML Engine

```env
MONGO_URI=your_mongodb_connection_string
DB_NAME=shopfusion
PORT=8000
```

---

# 🚀 Getting Started

## 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/shopfusion.git

cd shopfusion
```

---

## 2️⃣ Build Docker Images

```bash
docker compose build
```

---

## 3️⃣ Start All Containers

```bash
docker compose up -d
```

or

```bash
docker compose up --build
```

---

## 4️⃣ Check Running Containers

```bash
docker ps
```

---

## 5️⃣ Stop Containers

```bash
docker compose down
```

---

# 🌍 Application URLs

| Application | URL |
|--------------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| FastAPI Docs | http://localhost:8000/docs |

---

# 📊 Machine Learning Modules

- Hybrid Recommendation System
- Market Basket Analysis
- Association Rule Mining
- Product Recommendation
- Customer Recommendation
- Content-Based Filtering
- Collaborative Filtering

---

# 📦 APIs

- Authentication
- Products
- Categories
- Transactions
- Inventory
- Recommendations
- Dashboard Analytics
- Unlimited Data Import

---

# 🔥 Docker Commands

## Build

```bash
docker compose build
```

## Run

```bash
docker compose up -d
```

## Stop

```bash
docker compose down
```

## View Logs

```bash
docker compose logs
```

## List Containers

```bash
docker ps
```

## Remove Containers

```bash
docker compose down --volumes
```

---

# 📈 Future Enhancements

- ✅ GitHub Actions CI/CD
- ✅ Jenkins Pipeline
- ✅ AWS EC2 Deployment
- ✅ Kubernetes Deployment
- ✅ Helm Charts
- ✅ Nginx Reverse Proxy
- ✅ Prometheus & Grafana Monitoring
- ✅ ELK Logging Stack
- ✅ Docker Hub Image Publishing

---

# 👨‍💻 Author

## Rameshwar Mane
## Sakshi Hudge
## Sarvesh Asawa
## Omkar Kad

**Final-Year Information Technology Student (2026)**

- MERN Stack Developer
- DevOps Enthusiast
- Machine Learning Enthusiast
- AWS Certified Cloud Practitioner

---

# ⭐ Support

If you found this project useful, please consider giving it a **⭐ Star** on GitHub.

---

## 📜 License

This project is licensed under the **MIT License**.