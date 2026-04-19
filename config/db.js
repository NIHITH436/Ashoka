const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ashoka_db.json');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ users: [], shlokas: [], chats: [] }));
}

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { users: [], shlokas: [], chats: [] });

const initDB = async () => {
  await db.read();
  db.data ||= { users: [], shlokas: [], chats: [] };
  await db.write();
  console.log('Local database ready');
};

module.exports = { db, initDB };