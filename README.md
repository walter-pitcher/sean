# Trutim

**Real-time chat and collaboration for engineers and developers.** Built on Django Channels (WebSockets) and WebRTC for reliable live messaging, video calls, and screen sharing.

Features:
- **Live Chat** – Real-time messaging with WebSockets
- **Video Call** – WebRTC-based video conferencing
- **Screen Share** – Share your screen during calls
- **Strong Emojis** – Quick emoji bar + full emoji picker, message reactions

## Stack

- **Backend:** Django 4.x, Django REST Framework, Django Channels
- **Database:** PostgreSQL
- **Frontend:** React 19, Vite

## Setup

### 1. PostgreSQL

Create a database:

```sql
CREATE DATABASE trutim_db;
CREATE USER trutim_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE trutim_db TO trutim_user;
```

Or use Docker:

```bash
docker run -d --name trutim-db -e POSTGRES_DB=trutim_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Unix: source venv/bin/activate
pip install -r requirements.txt
```

Set environment variables (or use defaults):

```bash
# Windows CMD
set DB_NAME=trutim_db
set DB_USER=postgres
set DB_PASSWORD=postgres
set DB_HOST=localhost
set DB_PORT=5432

# Or create .env and use python-dotenv
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py createsuperuser   # optional, for admin
python manage.py runserver 0.0.0.0:8000
```

For WebSockets (ASGI), use Daphne:

```bash
daphne -b 0.0.0.0 -p 8000 trutim.asgi:application
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173 and proxies API/WS to the backend.

## Usage

1. **Register** – Create an account with username, email, title (e.g. Senior Engineer)
2. **Create Room** – From the dashboard, create a new room
3. **Chat** – Send messages, use quick emojis or the full picker
4. **Video Call** – Click the video icon in a room to start a call
5. **Screen Share** – Use the screen share button during a video call

## Project Structure

```
sean/
├── backend/
│   ├── trutim/          # Django project
│   ├── chat/            # Chat app (models, views, consumers)
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # EmojiPicker, VideoCall
│   │   ├── context/     # AuthContext
│   │   ├── hooks/      # useChatSocket, useCallSocket
│   │   └── pages/      # Login, Register, Dashboard, Room
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/auth/register/` – Register
- `POST /api/auth/login/` – Login (JWT)
- `GET /api/rooms/` – List rooms
- `POST /api/rooms/` – Create room
- `GET /api/messages/?room=<id>` – List messages

## WebSocket

- `ws://host/ws/chat/<room_id>/?token=<jwt>` – Chat
- `ws://host/ws/call/<room_id>/?token=<jwt>` – WebRTC signaling
