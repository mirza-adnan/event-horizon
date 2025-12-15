# Event Horizon

Event Horizon is a centralized platform for organizing and registering for events, primarily targeting institutional events that contain multiple segments. The platform facilitates event discovery, registration, team management, and organization verification.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   **Node.js**: (v18 or higher recommended)
-   **npm**: (comes with Node.js)
-   **Docker**: For running the PostgreSQL database.

### 1. Clone the repository

```bash
git clone <repository-url>
cd event-horizon
```

### 2. Backend Setup

Navigate to the `server` directory and install dependencies.

```bash
cd server
npm install
```

#### Environment Variables

Create a `.env` file in the `server/` directory based on the following example. This file will store your database connection string and JWT secret.

```
DATABASE_URL="postgresql://user:password@localhost:5433/eventhorizon_db"
JWT_SECRET="your_jwt_secret_key"
PORT="server_port"
```

_Replace `user`, `password`, and `eventhorizon_db` with your PostgreSQL credentials._

#### Database Setup

You can setup a local PostgreSQL database and use its connection string as the `DATABASE_URL` in the `.env` file.

Otherwise if you want to use docker, just run the following:

```bash
cd .. # if you are in server directory
docker-compose up -d postgres
```

Run database migrations to set up the schema:

```bash
npm run db:generate
npm run db:migrate
```

#### Run the Backend

```bash
npm run dev
```

The backend server will run on `http://localhost:5050` (default).

### 3. Frontend Setup

Open a new terminal, navigate to the `client` directory and install dependencies.

```bash
cd client
npm install
```

#### Run the Frontend

```bash
npm run dev
```

The frontend development server will usually start on `http://localhost:5173` (default).
