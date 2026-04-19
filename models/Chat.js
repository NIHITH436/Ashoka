const { db } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Chat = {
  async create({ userId }) {
    await db.read();
    const chat = { _id: uuidv4(), userId, messages: [], createdAt: new Date() };
    db.data.chats.push(chat);
    await db.write();
    return chat;
  },
  async findById(id) {
    await db.read();
    return db.data.chats.find(c => c._id === id) || null;
  },
  async save(chat) {
    await db.read();
    const index = db.data.chats.findIndex(c => c._id === chat._id);
    if (index !== -1) {
      db.data.chats[index] = chat;
      await db.write();
    }
    return chat;
  },
  async find({ userId }) {
    await db.read();
    return db.data.chats.filter(c => c.userId === userId).reverse();
  }
};

module.exports = Chat;