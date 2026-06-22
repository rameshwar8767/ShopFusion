# ShopFusion

## Objectives
The primary objective of ShopFusion is to provide a highly scalable, full-stack e-commerce application capable of processing and analyzing massive datasets in real-time. It aims to eliminate traditional memory constraints during large-scale data imports (the "Unlimited Import System") and leverage intelligent machine learning algorithms to uncover complex shopping patterns and provide personalized product recommendations.

## System Architecture
ShopFusion follows a modern microservices-oriented architecture split across three main pillars:
- Frontend Layer: A dynamic, responsive React-based client that visualizes data, manages streaming ingestion progress, and displays product bundles.
- Backend API Layer: A robust Node.js and Express server that handles database interactions, authentication, inventory logging, and features a constant-memory bulk data import engine.
- Machine Learning Engine: A Python-powered analytics engine that consumes database records to compute Market Basket Analysis, content-based filtering, and collaborative filtering to deliver a unified hybrid recommendation feed.

## Use of this project
This project serves as a comprehensive solution for retailers and e-commerce platforms dealing with large volumes of data. Use cases include:
- Massive Data Migration: Importing millions of product and transaction records from legacy systems without crashing servers.
- Smart Selling: Automatically discovering frequently bought together product pairs to increase average order value.
- Inventory Management: Identifying products nearing expiration to automatically boost their visibility in user feeds.
- Personalized Discovery: Providing shoppers with tailored recommendations based on both their historical behavior and product similarities.

## Tech Stack used
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Machine Learning Engine: Python 3, FastAPI, Pandas, Scikit-Learn, MLxtend
- Communication: REST APIs, Streaming JSON for real-time import progress

## How to run this project successfully
The system is designed to be easily launched using a unified batch script. Ensure you have Node.js, Python, and a MongoDB connection configured via your environment files.

1. Install Dependencies:
Open your terminal and install the node dependencies in the backend folder, the node dependencies in the frontend folder, and the python dependencies in the ml-engine folder. This only needs to be done once during the initial setup.

2. Launch the System:
Navigate to the root directory of the project using your File Explorer. Double-click the start_all batch script file. This will automatically open three separate windows running the Backend, the ML Engine, and the Frontend.

3. Verify:
Open your web browser and navigate to the local frontend address (usually localhost port 5173). The system is now fully operational and ready to process unlimited imports and generate recommendations!
