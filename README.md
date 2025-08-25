# Lead Management App

A full-stack application designed to help businesses manage and track potential customer leads effectively.

## Features

-   **User Authentication:** Secure user registration and login using JSON Web Tokens (JWT).
-   **Lead Management:** Full CRUD (Create, Read, Update, Delete) functionality for leads.
-   **Advanced Filtering:** Filter and search leads based on various criteria like status, source, value, and date.
-   **Environment-based Configuration:** Separate configurations for development (local) and production environments.
-   **RESTful API:** A well-structured backend API built with Node.js and Express.

## Tech Stack

-   **Frontend:** React
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB with Mongoose
-   **Authentication:** JSON Web Tokens (jsonwebtoken)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or newer recommended)
-   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd lead-management-app
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

## Configuration

The backend requires an `.env` file for environment variables.

1.  Navigate to the `backend` directory.
2.  Create a file named `.env`.
3.  Add the following configuration, replacing placeholder values as needed.

    ```env
    # Set the current environment ('development' or 'production')
    NODE_ENV=development

    # --- DATABASE CONNECTION STRINGS ---
    # Local database (for development on your machine)
    MONGO_URI_LOCAL=mongodb://localhost:27017/lead-management-system-localhost

    # Production database (for your live application)
    MONGO_URI_PROD=<Your_Actual_Production_MongoDB_Connection_String>

    # --- OTHER SECRETS ---
    # Use a strong, unique secret for JWT
    JWT_SECRET=your_super_secret_jwt_key
    ```

## Running the Application

You will need to run the backend and frontend servers in separate terminals.

1.  **Run the Backend Server:**
    -   Navigate to the `backend` directory.
    -   ```bash
        npm start
        ```
    -   The server will start on the port defined in your code (e.g., http://localhost:5000).

2.  **Run the Frontend Server:**
    -   Navigate to the `frontend` directory.
    -   ```bash
        npm start
        ```
    -   The React development server will start, and your application should open in a browser (e.g., http://localhost:3000).
