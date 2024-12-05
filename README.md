# ft_transcendence Project

ft_transcendence is a web-based multiplayer gaming platform designed to provide an engaging experience for users by playing Pong and exploring user-friendly features like matchmaking, chat integration, and customization. This project was collaboratively developed by a team of four contributors, implementing modular design principles with advanced technologies such as NestJS for the backend, React with TypeScript for the frontend, and Kafka for managing microservices communication. It operates as a single-page application (SPA).

---

# Table of Contents
- [Features](#features)
- [Installation and Setup](#installation-and-setup)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Authors](#authors)

---

# Features

## 1. User Management
- **Authentication**: Secure user login and registration using Codam credentials, via Intra's OAuth API with passport-42.
- **Profile Management**: Users can customize profiles, including avatars and display names.
- **Match History**: Tracks and displays detailed statistics of previous games.
- **Leaderboard**: A section showcasing the rank of all players along with their scores, updated in real-time.
- **Friends Management**: Users can add friends, view their online status, and interact with them.
- **Two-Factor Authentication (2FA)**: Adds an extra layer of security for user accounts.

## 2. Game Functionality
- **Pong Gameplay**: Classic Pong game recreated as a real-time multiplayer experience with the original visual style and dynamics.
- **3D Version**: An enhanced version of the game featuring 3D graphics for a more immersive and modern gameplay experience.
- **Matchmaking System**: Automatically pair players for games based on rank.
- **Bot Mode**: Play against the AI.

## 3. Chat Features
- **Chat Rooms**: Public (optionally with a password) or private chat rooms.
- **Direct Messaging**: One-on-one communication between users.
- **User Controls**: Chat owners and administrators can kick, ban, or mute users.
- **Game Invitations**: Send invitations directly from chat to play Pong.
- **User Blocking**: Prevent unwanted communication.
- **Profile Integration**: View other player profiles directly from the chat.

---

# Installation and Setup

<details>
  <summary><b>0. Prerequisites</b></summary>
  
- Docker and Docker Compose installed on your system.
- Node.js and npm installed (if running locally).
</details>

<details>
  <summary><b>1. Clone the repository</b></summary>
  
  ```bash
  git clone https://github.com/your-username/ft_transcendence.git
  cd ft_transcendence
  ```
</details>

<details>
  <summary><b>2. <code>.env</code> File Configuration</b></summary>
This project relies on a <code>.env</code> file for configuration. To simplify management and enhance modularity, the configuration is split into three separate files based on their competencies, all located in the root directory of the project:
<details>
  <summary><code>.env</code>: General configuration for the application.</summary>
  
```.env
# Postgres DB general
POSTGRES_USER=
POSTGRES_USER_AUTH=
POSTGRES_PORT=

# Api routes and ports
REACT_APP_HOST=""

# gateway service
REACT_APP_GATEWAY_PORT=

# authentication service
REACT_APP_AUTH_PORT=

# Authentication dm-auth-test app with LOCALHOST
REDIRECT_URL=
OAUTH_UID=
OAUTH_SECRET=

# jwt tokens
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRATION_TIME=
JWT_REFRESH_EXPIRATION_TIME=
JWT_ACCESS_TOKEN_COOKIE_NAME=""
JWT_REFRESH_TOKEN_COOKIE_NAME=""

# redirect links 
DASHBOARD_URL=
FRONTEND_URL=
2FA_URL=

# avatar-related variables
42_IMAGE_VERSION=""
DEFAULT_AVATAR_PATH=""
```
</details>

<details>
  <summary><code>.env.chat-db</code>: Configuration specific to the chat database.</summary>
  
```env
# Postgres DB - Chat service
POSTGRES_DB=
POSTGRES_PASSWORD=""
POSTGRES_PASSWORD_AUTH=
POSTGRES_HOST=
```
</details>

<details>
  <summary><code>.env.profile-db</code>: Configuration specific to the profile database.</summary>
  
```env
# Postgres DB - Profile service
POSTGRES_DB=
POSTGRES_PASSWORD=
POSTGRES_PASSWORD_AUTH=
POSTGRES_HOST=
```
</details>

Ensure all these files are properly configured before running the project.
</details>

<details>
  <summary><b>3. Build and start the containers</b></summary>
  
   ```bash
   make
   ```
Alternatively, you can use the following two-step process:
   ```bash
   make build
   make up
   ```

Finally, you can bring the project down with:
  ```bash
  make down
  ```
</details>

<details>
  <summary><b>4. Access the application</b></summary>
  Access the application browser at <a href="http://localhost:3000" target="_blank">http://localhost:3000</a>. 
</details>

---

# Project Structure

- [**Dockerized Environment**](docker-compose.yml): The project is containerized using Docker for seamless setup and deployment.
- [**Frontend**](frontend/): Built with React to create a responsive and intuitive user interface.
- [**Backend**](backend/): Designed as a collection of microservices for scalability and maintainability. Each microservice focuses on a specific domain:
  - [`auth`](backend/auth/): Handles authentication, including OAuth and 2FA.
  - [`chat`](backend/chat/): Manages chat functionalities, including chat rooms and messaging.
  - [`game`](backend/game/): Manages core game logic.
- **Infrastructure**:
  - [`gateway`](backend/gateway/): Acts as a central entry point, directing requests to the appropriate service.
  - [`Database`](database/): Includes configuration for PostgreSQL to manage persistent data.
  - **Kafka**: Ensures asynchronous communication and scalability for microservices.
    - [`user-service`](backend/user-service/): Handles user-related operations like authentication and profile management.
    - [`stats-service`](backend/stats-service/): Manages statistics and leaderboards.
    - [`game-service`](backend/game-service/): Coordinates game sessions and interactions.

---

# Technologies Used

## Backend

- Nest.js (Node.js framework): A progressive Node.js framework for building scalable and maintainable server-side applications, leveraging TypeScript for type safety and modern development practices.
- PostgreSQL: A powerful, open-source relational database system for managing application data.
- Apache Kafka: A distributed event-streaming platform used for real-time data pipelines and communication between microservices.
- OAuth2 and JWT handling: OAuth2 provides secure delegated access to resources, while JWT (JSON Web Tokens) handles user authentication and session management.
- Passport.js: Middleware for Node.js that simplifies authentication using various strategies, including OAuth2.

## Frontend

- React.js: A JavaScript library for building user interfaces with a component-based architecture.
- TypeScript: A strongly typed programming language that builds on JavaScript, enhancing developer productivity and code quality.

---

# Authors

The project was developed by the following contributors:

- **Darina**  
  [<img alt="GitHub" height="32px" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />](https://github.com/dmalac)
  [<img alt="LinkedIn" height="32px" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png" />](https://www.linkedin.com/in/dmalac)
- **Debora**  
  [<img alt="GitHub" height="32px" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />](https://github.com/greedymelon)
  [<img alt="LinkedIn" height="32px" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png" />](https://www.linkedin.com/in/debora-monfrini)
- **Emanuela**  
  [<img alt="GitHub" height="32px" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />](https://github.com/MagicEmy)
  [<img alt="LinkedIn" height="32px" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png" />](https://www.linkedin.com/in/emanuelalicameli/)
- **Orlando**  
  [<img alt="GitHub" height="32px" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />](https://github.com/OthelloPlusPlus)
  [<img alt="LinkedIn" height="32px" src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png" />](https://nl.linkedin.com/in/orlando-hengelmolen)

---
