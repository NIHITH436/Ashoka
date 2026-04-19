const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const Shloka = require('../models/Shloka');

// Add shloka
router.post('/shloka', auth, adminOnly, async (req, res) => {
  try {
    const { source, chapter, shloka, meaning, situation, tags } = req.body;
    const newShloka = await Shloka.create({
      source, chapter, shloka, meaning, situation, tags,
      addedBy: req.user.id
    });
    res.status(201).json({ message: 'Shloka added successfully', newShloka });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all shlokas
router.get('/shlokas', auth, adminOnly, async (req, res) => {
  try {
    const shlokas = await Shloka.find().sort({ createdAt: -1 });
    res.json(shlokas);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete shloka
router.delete('/shloka/:id', auth, adminOnly, async (req, res) => {
  try {
    await Shloka.findByIdAndDelete(req.params.id);
    res.json({ message: 'Shloka deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update shloka
router.put('/shloka/:id', auth, adminOnly, async (req, res) => {
  try {
    const updated = await Shloka.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Shloka updated', updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;