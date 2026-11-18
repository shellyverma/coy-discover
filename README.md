# Coy Discover

A swipe-based profile discovery application built using Next.js as part of the Coy SDE Intern Assignment.

## Features

- Discover 30 mock user profiles.
- Like and Pass functionality.
- Swipe profiles using drag gestures.
- One profile card displayed at a time.
- Mutual match detection.
- "It's a Match!" popup.
- Dedicated Matches section.
- Profiles disappear after being swiped.
- Empty state when no profiles remain.
- Swipe data persists after page refresh.
- Privacy-focused matching: only mutual matches are revealed.
- Home and Discover navigation tabs.

## Tech Stack

- Next.js
- React.js
- TypeScript
- Tailwind CSS
- Node.js
- Next.js API Routes
- JSON for data storage

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/feed` | Fetch profiles not yet swiped |
| POST | `/swipe` | Save Like or Pass action |
| GET | `/matches` | Fetch mutual matches |

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open project folder

```bash
cd coy-discover
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Production Build

```bash
npm run build
```

## Data Storage

- `data/profiles.json` stores mock profiles.
- `data/swipes.json` stores Like and Pass actions.
- The application assumes a single logged-in user and does not require external authentication.

## Project Purpose

Developed as an independent project for the Coy SDE Intern Assignment – Part B, demonstrating frontend development, API integration, swipe interactions, mutual matching, and privacy-focused backend logic.