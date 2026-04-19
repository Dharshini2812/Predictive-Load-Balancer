# Predictive Load Balancer

A full-stack application designed to monitor server infrastructure and perform load balancing based on predictive analysis.

## Features

- **Real-time Monitoring**: Track CPU, memory, and connection loads across multiple servers.
- **Predictive Analysis**: Forecast future server load trends using linear regression.
- **Dynamic Load Balancing**: Automatically identify optimal servers for incoming requests based on current and predicted load.
- **Server Infrastructure Management**: Add, delete, and manage server nodes through an intuitive dashboard.
- **Health Checks**: Automated monitoring of server health and system-wide utilization.

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Socket.io, node-cron
- **Frontend**: React, Material UI (MUI), Recharts, Socket.io-client
- **Database**: MongoDB

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or a remote URI)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Dharshini2812/Predictive-Load-Balancer.git
   cd predictive-load-balancer
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configure environment variables in `backend/.env`:
   ```env
   PORT=5005
   MONGODB_URI=mongodb://localhost:27017/loadbalancer
   ```

### Running with Docker

1. Ensure Docker and Docker Compose are installed.
2. Run the following command from the project root:
   ```bash
   docker-compose up --build
   ```
3. Access the dashboard at `http://localhost:3005`.

### Deployment to Render

This project is now fully optimized for Render. You can deploy it as a single service:

1. Connect your GitHub account to [Render](https://render.com/).
2. Click **New +** and select **Blueprint**.
3. Select this repository.
4. Click **Apply**.

Render will now automatically find the `Dockerfile` at the root, build both the frontend and backend, and deploy them together as one single service. This solves the "Dockerfile not found" error!

## License

This project is licensed under the ISC License.
