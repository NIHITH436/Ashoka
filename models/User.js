const { db } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const User = {
  async create({ name, email, password, role = 'user' }) {
    await db.read();
    const user = { _id: uuidv4(), name, email, password, role, createdAt: new Date() };
    db.data.users.push(user);
    await db.write();
    return user;
  },
  async findOne({ email }) {
    await db.read();
    return db.data.users.find(u => u.email === email) || null;
  },
  async findById(id) {
    await db.read();
    return db.data.users.find(u => u._id === id) || null;
  }
};

module.exports = User;