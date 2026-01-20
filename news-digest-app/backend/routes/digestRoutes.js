const express = require('express');
const Digest = require('../models/Digest');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /digest/:userId - get latest digest for user (protected)
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const digest = await Digest.findOne({ userId })
      .sort({ date: -1 })
      .limit(1);

    if (!digest) {
      return res.status(404).json({ message: 'No digest found for user' });
    }

    res.json(digest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get digest' });
  }
});

module.exports = router;

