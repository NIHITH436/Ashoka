const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const { getAshokaResponse } = require('../services/ashokaAI');

router.post('/message', auth, async (req, res) => {
  try {
    const { message, chatId } = req.body;

    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
    }
    if (!chat) {
      chat = await Chat.create({ userId: req.user.id });
    }

    const { reply, emotion } = await getAshokaResponse(message, chat.messages);

    chat.messages.push({ role: 'user', content: message, emotion });
    chat.messages.push({ role: 'assistant', content: reply });
    await Chat.save(chat);

    res.json({ reply, emotion, chatId: chat._id });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;