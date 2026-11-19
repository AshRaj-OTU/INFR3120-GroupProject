# INFR3120 Fall26 Project - Team handoff

## Project idea (draft for the group Word document)
The library booking web application will let students reserve study rooms and equipment online. Instead of manually checking availability, students will be able to select a resource, choose an available date and time, and save a booking. The application will have a shared database so room and equipment reservations can be checked for conflicting times before being confirmed.

The first release focuses on the main functionality rather than visual design. The group will use an Express and Node.js application with EJS pages, following the structure of Assignment 2. MongoDB will store the reservations, and Render will host the group website. The landing page will eventually include the team logo, booking links and a list of bookings. Colours and animations will be added in later releases.

## Responsibility table (replace placeholders with actual names)

| Member | Duties | Main files |
|---|---|---|
| Ashwin Rajakrishna | Express setup, MongoDB connection, booking model, server-side validation, overlap check, saving bookings and deployment setup | app.js, server.js, config/database.js, models/booking.js, lib/createBooking.js, lib/validateBooking.js, .env.example, .gitignore, render.yaml |
| Member 2 | Room rules, date page, room/time availability grid and booking form | routes/rooms.js, lib/schedule.js, views/rooms/, views/schedule.ejs |
| Member 3 | Equipment booking, landing page, team logo, bookings table, confirmation email and shared layout | routes/equipment.js, routes/index.js, routes/bookings.js, lib/mailer.js, remaining views/, public/ |

## Integration agreement (proposed)
Both parts call `require('../lib/createBooking')` with a plain object: `bookingType` (`room` or `equipment`), `resourceId`, `studentName`, `studentNumber`, `email`, `date` (`YYYY-MM-DD`), `startTime`, and `endTime` (`HH:MM`, 24-hour). All are strings. Use consistent lower-case resource identifiers, and set bookingType on the server. A successful call returns a saved booking; invalid data throws an error with status 400, and overlap throws status 409. Other failures should be handled as 500. Team members must confirm actual rooms, equipment, rules and student requirements; no official resource list or rule set was supplied.

The room and equipment routes must call the shared helper rather than save directly with the model. The bookings table can use `Booking.find()` with a projection to omit student information from public pages. Part 3 should send confirmation emails only after a booking has saved successfully.

## Repo and demo tasks
- Create the public GitHub repository named `INFR3120 Fall26 Project` (GitHub may normalize spaces in the URL). Add each member as a collaborator.
- Each member should commit their own reviewed changes from their own GitHub account. Do not fabricate commit history.
- Copy the project idea and responsibility table into the group's required Word document, confirm all names and duties, and add the document to GitHub.
- Merge the actual landing page, team-created logo, room/equipment forms, public booking list and shared layout. The local backend demo is not the final landing page.
- Deploy the merged project to Render, configure MongoDB credentials privately and test it.
- Record a group video of up to 30 minutes in which every member appears and explains their actual work.

## Ashwin's demo sequence
1. Show the project folder and `app.js`: Express, EJS, middleware and route mounting.
2. Show `server.js` and `config/database.js`: read the environment variables and connect before listening on the port. Never show the real database password.
3. Show `models/booking.js`: explain the shared fields for rooms and equipment.
4. Explain `lib/validateBooking.js`: required values, valid date/time, email and end time after start time.
5. Explain `lib/createBooking.js`: same resource/date, existing start before requested end AND existing end after requested start. Show why adjacent time slots are allowed. Explain the single-process queue and its limitation.
6. In a local test database, open `/demo` and create a 10:00–11:00 booking. Try the same booking again and show the conflict message. Then book 11:00–12:00 and show success. Show records in MongoDB and run `npm test`.
7. Once the team has deployed, show the Render service and `/health` without exposing credentials. Explain how teammates use the same helper.

Use the demo sequence only after testing the actual application. The README identifies what has and has not been verified.
