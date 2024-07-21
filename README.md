# Client Application

This is the client application for managing jobs and clients. It provides a user interface to create clients and jobs, and to view job statuses and results.


## Prerequisites

- Node.js (version 20.x or later)
- npm (version 10.x or later)

## Setup

```
   - cd client
   - npm install
   - touch .env (create .env file)
   - Add thes values in .env file
      - REACT_APP_API_URL=http://localhost:3001
      - REACT_APP_WS_URL=ws://localhost:3001
   - npm start
```


# Server Application

## Prerequisites

- Node.js (version 20.x or later)
- npm (version 10.x or later)
- Redis (version 7.x or later)

## Setup
   ```
   - git clone <repository-url>
   - npm install
   - touch .env (create .env file)
   - Add then values in .env file
      - PORT=3001
      - CLIENT_URL=http://localhost:3000
      - REDIS_HOST=localhost
      - REDIS_PORT=6379
      - UNSPLASH_URL=https://api.unsplash.com
      - UNSPLASH_CLIENT_ID=7tXD0_YyDEKqptPoGj-o3vHtBlNjPNkmhkUgh4Ayskw
      - npm start
   ```
