# Dream Journal App

A full-stack web application that allows users to record their dreams and receive AI-powered interpretations using Gemini.

## Features

- Record dreams with timestamp
- Get AI interpretations of your dreams
- View all past dreams and their interpretations
- Delete dreams
- SQLite database for persistent storage
- Vanilla JavaScript frontend
- Express backend with RESTful API

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: SQLite
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **AI**: Google Gemini API

## Project Structure

```
dream-journal/
├── server.js           # Express server and API routes
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (create this)
├── .env.example       # Example env file
├── dreams.db          # SQLite database (auto-created)
└── public/
    ├── index.html     # Frontend HTML
    ├── styles.css     # Styles
    └── app.js         # Frontend JavaScript
```

## Setup Instructions

### Run with Docker

Set `GEMINI_API_KEY` in a root `.env` file (or in your shell), then start the app:

```bash
docker compose up --build
```

Open `http://localhost:3001`. Compose stores the SQLite database in the `dreams-data` named volume, so it persists across container rebuilds. To stop the app, run `docker compose down`; to also delete the database, run `docker compose down --volumes`.

Set `HOST_PORT` in `.env` to change the host port, or set `GEMINI_MODEL` to use a different Gemini model.

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=3001
```

Get your API key from: https://aistudio.google.com/app/apikey

### 3. Run the Application

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The app will be available at `http://localhost:3001` by default.

## API Endpoints

- `GET /api/dreams` - Get all dreams
- `GET /api/dreams/:id` - Get a specific dream
- `POST /api/dreams` - Create a new dream (requires `dream_text` in body)
- `DELETE /api/dreams/:id` - Delete a dream

## Deployment to Render

### 1. Prepare Your Repository

Make sure your code is in a Git repository (GitHub, GitLab, etc.)

### 2. Create a New Web Service on Render

1. Go to https://render.com and sign in
2. Click "New +" and select "Web Service"
3. Connect your repository
4. Configure the service with the repository root as the **Root Directory** (leave it blank if `package.json` is at the repository root):
    - **Environment**: Node
    - **Build Command**: `npm ci`
    - **Start Command**: `npm start`

### 3. Add Environment Variables

In the Render dashboard, add:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `GEMINI_MODEL`: Optional; defaults to `gemini-2.5-flash`

### 4. Deploy

Click "Create Web Service" and Render will deploy your app automatically.

### 5. Database Persistence

Note: SQLite data is stored on Render's ephemeral filesystem unless you attach a persistent disk. For persistent storage, attach a disk and set `DATABASE_PATH` to a file path on that disk, such as `/var/data/dreams.db`.

## Usage

1. Enter your dream in the text area
2. Click "Get Interpretation" to save the dream and receive an AI interpretation
3. View all your dreams below, sorted by most recent
4. Click "Delete" to remove a dream

## License

MIT