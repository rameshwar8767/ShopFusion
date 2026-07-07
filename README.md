# 🚀 ShopFusion – Hybrid Retail Analytics & Recommendation System

![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)
![Jenkins](https://img.shields.io/badge/Jenkins-CI/CD-D24939?logo=jenkins)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)
![FastAPI](https://img.shields.io/badge/ML-FastAPI-009688?logo=fastapi)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)
![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy-009639?logo=nginx)
![License](https://img.shields.io/badge/License-MIT-green)

## 📖 Overview

ShopFusion is a full-stack hybrid retail analytics platform that enables retailers to manage inventory, analyze customer purchasing behavior, and generate intelligent product recommendations using machine learning.

The project follows a microservices architecture with separate React, Node.js, and FastAPI services. It is fully containerized with Docker, orchestrated using Docker Compose, and supports CI/CD with Jenkins and Docker Hub.

---

# ✨ Features

- JWT Authentication & Authorization
- Product, Category & Inventory Management
- Customer & Transaction Management
- Dashboard Analytics
- Market Basket Analysis
- Hybrid Recommendation Engine
- FastAPI ML Service
- REST APIs
- Dockerized Microservices
- Multi-stage Docker Builds
- Jenkins CI/CD Pipeline
- Docker Hub Image Publishing

---

# 🏗 Architecture

```text
                   Browser
                      │
                      ▼
             React + Nginx
                 Port 3000
                      │
                      ▼
             Node.js Express API
                 Port 5000
              │              │
              ▼              ▼
      MongoDB Atlas     FastAPI ML
                           Port 8000
```

---

# 📁 Project Structure

```text
ShopFusion/
├── frontend/
├── backend/
├── ml-engine/
├── docker-compose.yml
├── Jenkinsfile
├── README.md
├── products_dataset.xlsx
└── transactions_dataset.xlsx
```

---

# 🛠 Tech Stack

## Frontend
- React
- Vite
- Tailwind CSS
- Axios

## Backend
- Node.js
- Express.js
- JWT
- Mongoose

## Machine Learning
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
- Jenkins
- Docker Hub
- Nginx
- GitHub
- Multi-stage Docker Builds

---

# 🐳 Docker Services

| Service | Port |
|----------|------|
| Frontend | 3000 |
| Backend | 5000 |
| ML Engine | 8000 |

---

# ⚙ Environment Variables

## frontend/.env

```env
VITE_API_URL=http://localhost:5000
```

## backend/.env

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_EXPIRE=30d
PYTHON_API_URL=http://ml-engine:8000
CLIENT_URL=http://localhost:3000
```

## ml-engine/.env

```env
PORT=8000
MONGO_URI=your_mongodb_uri
DB_NAME=shopfusion
```

---

# 🚀 Local Setup

```bash
git clone https://github.com/rameshwar8767/ShopFusion.git
cd ShopFusion
```

Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
cd ../ml-engine && pip install -r requirements.txt
```

---

# 🐳 Docker Setup

Build images

```bash
docker compose build
```

Run

```bash
docker compose up -d
```

Logs

```bash
docker compose logs -f
```

Stop

```bash
docker compose down
```

---

# 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| FastAPI Docs | http://localhost:8000/docs |

---

# 🔄 CI/CD Pipeline

The project uses Jenkins for continuous integration and deployment.

Pipeline stages:

1. Checkout source code
2. Install dependencies
3. Build Docker images
4. Login to Docker Hub
5. Push images
6. Deploy using Docker Compose

Workflow

```text
Developer
    │
    ▼
GitHub
    │
Webhook
    ▼
Jenkins
    │
Checkout
    │
Build
    │
Docker Build
    │
Docker Hub Push
    │
Deploy
    ▼
Production
```

---

# 🔐 Jenkins Credentials

Create the following credentials in Jenkins.

| ID | Type |
|----|------|
| dockerhub | Username with Password |
| github-token *(optional)* | Secret Text |

Password should be your Docker Hub Personal Access Token.

---

# 📝 Example Jenkinsfile

```groovy
pipeline {
    agent any

    environment {
        IMAGE_NAME = "your-dockerhub-username/shopfusion-backend"
    }

    stages {
        stage('Checkout'){
            steps{
                checkout scm
            }
        }

        stage('Build'){
            steps{
                sh 'docker compose build'
            }
        }

        stage('Docker Login'){
            steps{
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]){
                    sh 'echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin'
                }
            }
        }

        stage('Push'){
            steps{
                sh 'docker compose push'
            }
        }

        stage('Deploy'){
            steps{
                sh 'docker compose up -d'
            }
        }
    }
}
```

---

# 📦 Docker Hub

Tag image

```bash
docker tag shopfusion-backend your-dockerhub-username/shopfusion-backend:latest
```

Push

```bash
docker push your-dockerhub-username/shopfusion-backend:latest
```

---

# 📊 Machine Learning

- Hybrid Recommendation System
- Market Basket Analysis
- Association Rule Mining
- Content-Based Filtering
- Collaborative Filtering

---

# 📡 REST APIs

- Authentication
- Users
- Products
- Categories
- Inventory
- Transactions
- Analytics
- Recommendations

---

# 📈 Future Enhancements

- Kubernetes Deployment
- Helm Charts
- AWS EC2 Deployment
- Nginx Reverse Proxy
- GitHub Actions
- Prometheus Monitoring
- Grafana Dashboards
- ELK Stack Logging
- SonarQube Code Analysis
- Automated Testing

---

# 👨‍💻 Authors

- Rameshwar Mane
- Sakshi Hudge
- Sarvesh Asawa
- Omkar Kad

**Final-Year Information Technology Student (2026)**

- MERN Stack Developer
- DevOps Enthusiast
- AWS Certified Cloud Practitioner
- Machine Learning Enthusiast

---

# ⭐ Support

If you like this project, please give it a ⭐ on GitHub.

# 📜 License

Licensed under the MIT License.
