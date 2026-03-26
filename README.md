# Pirates Cup U21 2026 Tournament Manager

A comprehensive tournament management application for the Pirates Cup U21 2026 football tournament.

## Features

- **Admin Dashboard**: Team registration, sponsorship management
- **Coach Dashboard**: Match schedule, squad management, lineup confirmation
- **Field Manager Dashboard**: Daily checklists, live match recording
- **Tournament Manager Dashboard**: Live updates, standings, match reports
- **Spectator/Fanzone**: Live scores, standings, match schedules

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Firebase (Auth, Firestore, Storage, Hosting)

## Deployment

This project is configured for automatic deployment to Firebase Hosting via GitHub Actions.

### Required GitHub Secrets

Add these secrets in your GitHub repository settings:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`

## Demo Accounts

- **Admin**: admin@piratescup.org / password
- **Coach**: coach@piratescup.org / password
- **Field Manager**: fieldmanager-a@piratescup.org / password
- **Tournament Manager**: manager@piratescup.org / password
