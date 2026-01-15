Local backend for Recovibe "2nd.html" form

What I added
- `server.js` - Express server that serves the `html/` folder and provides `POST /api/submit` to save interests.
- `db.js` - SQLite helper that creates `data.sqlite` and a `submissions` table.
- `package.json` - npm manifest with dependencies and `start` script.
- Updated `html/2nd.js` to POST selected interests to `/api/submit` when Firebase is not available.

How to run (Windows PowerShell)
1. Open PowerShell and change to the project folder (the folder that contains `server.js`):

   cd "c:\Users\Rhodora\RecoVibe_\Legit-na-to-1\rec-vibe-1"

2. Install dependencies:

   npm install

3. Start the server:

   npm start

4. Open the UI in your browser (the server serves the html folder):

   http://localhost:3000/2nd.html

5. Select up to 5 interests and click "Next". If the server is running, the selections will be saved to `data.sqlite` in the same folder.

Verification
- After submitting, you should see a success alert with the inserted row ID.
- The SQLite file `data.sqlite` will contain a `submissions` table with the stored interests as JSON.

Notes & next steps
- If you already use Firebase, this preserves the existing Firebase save flow.
- This backend is intentionally minimal and is suitable for local development/testing. For production you'll want authentication, input validation, and secure hosting.
- If you'd like, I can add a small admin UI to view submissions or an endpoint to export CSV.
