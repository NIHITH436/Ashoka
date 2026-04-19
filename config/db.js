const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const adapter = new JSONFile(path.join(__dirname, '../data/ashoka_db.json'));
const db = new Low(adapter, {
  users: [],
  shlokas: [],
  chats: []
});

const initDB = async () => {
  await db.read();
  db.data ||= { users: [], shlokas: [], chats: [] };
  await db.write();
  console.log('Local database ready');
};

module.exports = { db, initDB };