# Campus Booking – INFR3120 Fall 2026 Group Project

Group 64

Our site lets Ontario Tech students book study rooms and networking and computer science/engineering lab equipment online. Students choose a resource, date and open time slot. The shared MongoDB database stores reservations and checks for conflicting bookings. Upcoming reservations appear on the home page and the bookings page.

## Group responsibilities

- Avi Patel: Landing page, equipment booking, bookings table, rules page, styles and README.
- Ashwin Rajakrishna: Express backend, MongoDB connection, booking model, validation, overlap checking and Render deployment.
- Damanjeet: Study room booking, schedule grid and booking form.

## Run locally

Use Node.js 22. Open the repository root in VS Code and run:

```sh
npm install
npm start
```

Open http://localhost:3000. The application starts in preview mode without MongoDB. To enable real bookings, copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection string. Restart the application. Never commit `.env` or real credentials. Use dummy student data for testing.

## Pages

- `/` – landing page and upcoming reservations
- `/rooms` – study room dates, schedule and booking form
- `/equipment` – lab equipment, schedule and booking form
- `/bookings` – upcoming bookings
- `/rules` – booking rules
- `/health` – database status and preview/live mode

## Render

Use a Node Web Service connected to `main`. Leave Root Directory blank. Build command: `npm install`. Start command: `npm start`. Health check: `/health`. Set `NODE_ENV=production` and `TZ=America/Toronto`. Render supplies PORT. Add `MONGODB_URI` in Render for live bookings. Optional SMTP settings from `.env.example` enable confirmation email if the hosting service permits the connection.

## Testing and first-release limitations

Run `npm test` for validation, overlap checks, simultaneous requests in one process and schedule tests. Run `npm run test:preview` after installing dependencies for an HTTP preview smoke test. Live MongoDB, email and Render deployment have not been verified in this environment.

The preview displays the pages and schedules but cannot verify availability or save reservations. The integrated room form uses the original two-hour maximum per reservation and requires a student number, as does the equipment form. Daily/term limits, cancellation and automatic forfeiture are not implemented. The overlap queue protects a single Node process, not multiple instances. Replace the placeholder logo with the group's final original logo. The project uses the original Part 1 schema; any existing records using a different schema would need migration.


