const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(DB_PATH);

// Initialize table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      interests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function addSubmission(interests, userId = null) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO submissions (userId, interests) VALUES (?, ?)');
    stmt.run(userId, JSON.stringify(interests), function (err) {
      if (err) return reject(err);
      resolve(this.lastID);
    });
    stmt.finalize();
  });
}

function getSubmissions() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM submissions ORDER BY created_at DESC', [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  addSubmission,
  getSubmissions,
  db
};
