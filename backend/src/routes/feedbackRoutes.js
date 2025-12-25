import express from 'express';
import UserEvent from '../models/UserEvent.js';

const router = express.Router();

// Submit rating
router.post('/', async (req, res) => {
  try {
    const { userId, eventId, rating } = req.body;

    // Validation
    if (!userId || !eventId || ![1, 3, 5].includes(rating)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters. Rating must be 1, 3, or 5'
      });
    }

    const userEvent = await UserEvent.findOneAndUpdate(
      { userId, eventId },
      {
        rating,
        ratedAt: new Date()
      },
      { new: true }
    );

    if (!userEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found for this user'
      });
    }

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      rating
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

// Get feedback page (for email links)
router.get('/', async (req, res) => {
  try {
    const { event: eventId, user: userId, rating } = req.query;

    if (!userId || !eventId || ![1, 3, 5].includes(parseInt(rating))) {
      return res.status(400).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>Invalid feedback link</h2>
          </body>
        </html>
      `);
    }

    // Submit rating
    await UserEvent.findOneAndUpdate(
      { userId, eventId },
      {
        rating: parseInt(rating),
        ratedAt: new Date()
      }
    );

    const ratingText = {
      1: 'Not Useful',
      3: 'Okay',
      5: 'Very Useful'
    }[rating];

    res.send(`
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #0066cc; }
            .emoji { font-size: 64px; margin: 20px 0; }
            p { color: #666; line-height: 1.6; }
            .btn { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">${rating === 5 ? '🎉' : rating === 3 ? '👍' : '📝'}</div>
            <h1>Thank You!</h1>
            <p>Your feedback has been recorded: <strong>${ratingText}</strong></p>
            <p>This helps us improve your personalized intelligence feed.</p>
            <a href="${process.env.FRONTEND_URL}/dashboard?user=${userId}" class="btn">Go to Dashboard</a>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Something went wrong</h2>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
});

export default router;