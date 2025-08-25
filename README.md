Lead Management System

This is a full-stack MERN (MongoDB, Express, React, Node.js) application designed to manage sales leads efficiently. It provides user authentication and full CRUD (Create, Read, Update, Delete) functionality for leads.
Tech Stack

    Frontend: React, CSS

    Backend: Node.js, Express.js

    Database: MongoDB (using Mongoose)

    Authentication: JSON Web Tokens (JWT)


Prerequisites

Before you begin, ensure you have the following installed on your system:

    Node.js (which includes npm)

    MongoDB (or a MongoDB Atlas account for a cloud-hosted database)

Backend Setup

    Clone the repository:

    git clone https://github.com/deepakkumartripathi119/lead-management-app-tes1/

    Navigate to the backend directory:

    cd lead-management-app-tes1/backend

    Install dependencies:

    npm install

    Create the environment file:
    Create a file named .env in the backend directory and add the following variables.

    # Set the environment to 'anything except 'production' to run locally'
    NODE_ENV=development

    # The port the backend server will run on. Use 5001 for local development.
    PORT=5001

    # Your production MongoDB connection string (e.g., from MongoDB Atlas)
    MONGO_URI_PRODUCTION=mongodb+srv://<user>:<password>@<cluster-url>/<database-name-1>

    # A local MongoDB connection string 
    MONGO_URI_LOCAL=mongodb+srv://<user>:<password>@<cluster-url>/<database-name-2>

    # A long, random, and secret string for signing JSON Web Tokens
    JWT_SECRET=your_super_secret_jwt_key_here

    Note: Replace the placeholder values (<... >) with your actual database credentials. Your JWT_SECRET should be a long, random string for security.

    Run the server:

    npm start

    The backend server will be running on http://localhost:5001.

Frontend Setup

    Navigate to the frontend directory:

    cd lead-management-app-tes1/frontend

    Install dependencies:

    npm install

    Create the environment file:
    Create a file named .env in the frontend directory and add the following variable.

    # The base URL for your deployed backend API
    REACT_APP_API_URL=https://lead-management-backend-xixm.onrender.com/api

    For local development, you might want to point this to your local backend server:

    REACT_APP_API_URL=http://localhost:5001/api

    Run the React application:

    npm start

    The frontend development server will open in your browser at http://localhost:3000.