# zIDE Project

The **zIDE Project** is a modern web-based Integrated Development Environment (IDE) designed to simplify coding and collaboration. This project is organized into two main folders:

- `client`: Contains the frontend code of the application.
- `server`: Contains the backend code and API logic.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Folder Structure](#folder-structure)
  - [Client Folder](#client-folder)
  - [Server Folder](#server-folder)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Contributing](#contributing)
- [License](#license)

## Project Overview
The zIDE project enables developers to write, test, and manage code directly in their browser. It includes a real-time collaborative environment, code execution support for multiple programming languages, and customizable layouts to fit user preferences.

## Features
- Code editor with syntax highlighting
- Multi-language support
- Real-time collaboration
- User authentication and project management
- Dark mode toggle
- Integration with Zoho Cliq for enhanced team communication

## Folder Structure

### Client Folder
The `client` folder contains all the code for the frontend of the application, including React components, styling, and assets.

#### Key Files and Directories:
- `src/`
  - `styles/`: Contains CSS and Tailwind configurations.
  - `utils/`: Contains utility functions used across the application.
  - `App.js`: Main entry point for the React app.
- `public/`: Contains static files like `index.html`.

### Server Folder
The `server` folder contains the backend logic, including API routes and database management.

#### Key Files and Directories:
- `models/`: Contains database schema definitions.
- `config/`: Contains configuration files for the server (e.g., environment variables).
- `index.js`: Main entry point for the server application.

## Technologies Used

### Frontend
- React.js
- Tailwind CSS
- Redux (for state management)

### Backend
- Node.js
- Express.js
- MongoDB (for database management)

### Other Tools
- Zoho Catalyst
- Zoho Cliq integration

## Setup Instructions

### Frontend Setup
1. Navigate to the `client` folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in a `.env` file:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear messages.
4. Push your branch and create a Pull Request.

## License
This project is licensed under the [MIT License](LICENSE).
