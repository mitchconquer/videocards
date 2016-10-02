const file = './blank/collection.anki2';
const sqlite = require('sqlite3');

sqlite.verbose();

const db = new sqlite.Database(file);
console.log({db});
db.get('SELECT * FROM cards', [], (err, result) => {
  console.log({err, result});
});