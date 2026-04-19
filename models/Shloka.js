const { db } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Shloka = {
  async create({ source, chapter, shloka, meaning, situation, tags, addedBy }) {
    await db.read();
    const newShloka = { _id: uuidv4(), source, chapter, shloka, meaning, situation, tags, addedBy, createdAt: new Date() };
    db.data.shlokas.push(newShloka);
    await db.write();
    return newShloka;
  },
  async find(query = {}) {
    await db.read();
    let results = db.data.shlokas;
    if (query.tags) {
      results = results.filter(s => s.tags?.some(t => query.tags.includes(t)));
    }
    return results;
  },
  async findById(id) {
    await db.read();
    return db.data.shlokas.find(s => s._id === id) || null;
  },
  async findByIdAndDelete(id) {
    await db.read();
    db.data.shlokas = db.data.shlokas.filter(s => s._id !== id);
    await db.write();
  },
  async findByIdAndUpdate(id, update) {
    await db.read();
    const index = db.data.shlokas.findIndex(s => s._id === id);
    if (index !== -1) {
      db.data.shlokas[index] = { ...db.data.shlokas[index], ...update };
      await db.write();
      return db.data.shlokas[index];
    }
    return null;
  },
  async search(keyword) {
    await db.read();
    const kw = keyword.toLowerCase();
    return db.data.shlokas.filter(s =>
      s.tags?.some(t => t.toLowerCase().includes(kw)) ||
      s.situation?.toLowerCase().includes(kw) ||
      s.meaning?.toLowerCase().includes(kw)
    ).slice(0, 3);
  }
};

module.exports = Shloka;