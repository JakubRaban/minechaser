# Minechaser (https://minechaser.com)

Minechaser is a web-based multiplayer game based on mechanics known from the classical Minesweeper. Instead of clicking on the board though, the players compete in real time by walking around the board and marking mines with flags. Every correctly placed flag is awarded with a point. Placing flags incorrectly results with an increasing penalty. Player who survives and gains most points wins. 
Bonuses can be collected to boost one's progress or impede the opponents.

## Running locally

Prerequisites: Python v3.10, pip v23, Node.js v18, npm v10

```
npm install
pip install -r requirements.txt
npm start
cd api && gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 --bind 0.0.0.0:5000 app:socketio_app
```

Then visit http://localhost:3000 in your browser.

## Features

- Three game modes
  - Online game, where player joins a global queue to play with other players on the web
  - Private game, where a link can be shared among a group of friends
  - Single-player game
- User preferences
  - Username, visible to other players
  - Other preferences taking effect locally: disable music, disable sound effects, enable color-blind mode
- In-game features:
  - Real-time updates for players' score, elapsed time, remaining mine count
  - Keyboard controls for desktop users and on-screen controls for touch-screen users, detected automatically
  - Players who stepped on a mine can spectate it or play again
- Game summary screen with players' scores and simple statistics about the game
  - Players in private game are proposed to play against each other again
  - From here players can share the game if they liked it
- Responsive design for all screen sizes

## Implementation

### Tech Stack

- React v18 with React Router v6, TypeScript v4.9 and ESLint v8
- Build system: Vite v4
- CSS preprocessors and libraries:
  - SASS
  - PostCSS with Autoprefixer and Preset Env (for converting some of the modern CSS syntax for older browsers)
  - PicoCSS v2 - a minimal CSS library leveraging semantic HTML to apply styles
  - Tippy.js for minimal tooltips
- Python v3.10
  - Gunicorn - WSGI HTTP Server
  - Gevent - coroutine-based networking library with Websocket support
  - Bottle.py - for minimal HTTP request handling
  - `APScheduler` library for scheduling game events
- Websocket communication implemented with [socket.io](https://socket.io) library and its Python counterpart on the server, `python-socketio`

### Selected implementation details

#### React, JavaScript
- State fully managed using built-in React features: `useState` hook and contexts
- Component lazy-loading and preloading used to minimize initial bundle size and improve perceived performance (e.g. some components are preloaded during animations)
- Custom hooks used to abstract separate reusable and/or complex logic away from components
- Physical/touchscreen keyboard detection implemented by checking time elapsed between `keydown` and `keyup` events
- Player ID and preferences are stored in `localStorage`, conserving the player's profile for the next time they play
- Optimistic UI updates used for a smoother user experience, minimizing the impact of latency in response time

#### CSS
- Fully responsive design implemented using media queries
- PicoCSS used to leverage semantic HTML elements (like `dialog`, `article`, `details`, `progress`, `[role]`) to apply styles
- Container queries used to appropriately size elements within a cell during the game
- OKLCH color space used to pick colors of identical perceived brightness
- CSS Layers used to keep selector specificity as low as possible, keeping the stylesheets clean

#### Python
- Code arranged in views, services and models
- State of games and information about players is stored in-memory using a `dict`. In case of server restart (e.g. during a deployment), information about players is serialized, stored and deserialized
- `jsonpickle` library is used to serialize parts of the state of the game when it is sent to the client. Inclusion of sensitive information is avoided thanks to implementing custom `__getstate__` magic method on the model classes.
- Very primitive queue algorithm is used in matchmaking. Players are dequeued when there are 4 players in the queue (maximum number in a game) or with at least two players, the longest waiting player is in the queue for at least 15 seconds.
- `APScheduler` library is used to schedule future events, like player dequeuing, timing the start of the game, delete finished games, placing bonuses on the board etc.
- The server runs in a single thread, utilizing `gevent` for spawning greenlets - lightweight coroutines for in-process concurrent execution

#### Communication and networking
- Socket.io is used for communication, providing useful abstractions and mechanisms like broadcasting, rooms, auto-reconnections etc.
- Difference between client time and server time is calculated when user opens the website and accounted for in further calculations
- Primitive admin console implemented to remotely access and alter the state (password-protected)