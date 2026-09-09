import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Save game score for authenticated user - Input: score, result, boxes_opened, treasure_found, Output: score record
router.post('/', authenticateToken, [
  body('score').isInt(),
  body('result').isIn(['Win', 'Tie', 'Loss']),
  body('boxes_opened').isInt({ min: 1, max: 3 }),
  body('treasure_found').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { score, result, boxes_opened, treasure_found } = req.body;
    const userId = req.user.id;

    const scoreRecord = await db.runAsync(
      `INSERT INTO game_scores (user_id, score, result, boxes_opened, treasure_found) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, score, result, boxes_opened, treasure_found]
    );

    res.status(201).json({
      message: 'Score saved successfully',
      scoreId: scoreRecord.lastID
    });
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's score history - Input: user from token, Output: array of score records
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const scores = await db.allAsync(
      `SELECT score, result, boxes_opened, treasure_found, played_at 
       FROM game_scores 
       WHERE user_id = ? 
       ORDER BY played_at DESC`,
      [userId]
    );

    // Calculate statistics
    const stats = {
      totalGames: scores.length,
      wins: scores.filter(s => s.result === 'Win').length,
      losses: scores.filter(s => s.result === 'Loss').length,
      ties: scores.filter(s => s.result === 'Tie').length,
      highestScore: scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0
    };

    res.json({
      scores: scores.slice(0, 10), // Return last 10 games
      stats
    });
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;