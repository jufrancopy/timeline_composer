const express = require('express');
const router = express.Router();
let prisma;

const setPrismaClient = (client) => {
  prisma = client;
};

// POST /ratings - Add a new rating for a composer
router.post('/', async (req, res) => {
  try {
    const { composerId, rating_value } = req.body;
    const ip_address = req.ip; // Get IP address from the request

    if (!composerId || !rating_value) {
      return res.status(400).json({ error: 'Composer ID and rating value are required.' });
    }

    // Check if the composer exists
    const composerExists = await prisma.composer.findUnique({
      where: { id: composerId },
    });

    if (!composerExists) {
      return res.status(404).json({ error: 'Composer not found.' });
    }

    // Check if the user (by IP) has already rated this composer
    const existingRating = await prisma.rating.findUnique({
      where: {
        composerId_ip_address: {
          composerId: composerId,
          ip_address: ip_address,
        },
      },
    });

    if (existingRating) {
      // Update the existing rating if the user has already rated this composer
      const updatedRating = await prisma.rating.update({
        where: {
          composerId_ip_address: {
            composerId: composerId,
            ip_address: ip_address,
          },
        },
        data: {
          rating_value: rating_value,
        },
      });

      // Recalculate average rating for the composer and return the updated rating
      const allRatings = await prisma.rating.findMany({
        where: { composerId: composerId },
        select: { rating_value: true },
      });

      const totalRatings = allRatings.length;
      const sumRatings = allRatings.reduce((sum, r) => sum + r.rating_value, 0);
      const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

      return res.status(200).json({
          message: 'Rating updated successfully',
          rating: updatedRating,
          average_rating: averageRating,
          total_ratings: totalRatings
      });
    }

    // Create the new rating
    const newRating = await prisma.rating.create({
      data: {
        composerId: composerId,
        rating_value: rating_value,
        ip_address: ip_address,
      },
    });

    // Recalculate average rating for the composer
    const allRatings = await prisma.rating.findMany({
      where: { composerId: composerId },
      select: { rating_value: true },
    });

    const totalRatings = allRatings.length;
    const sumRatings = allRatings.reduce((sum, r) => sum + r.rating_value, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    // Update the composer's average rating (if we decide to store it on the composer model)
    // For now, let's just return the new rating and the calculated average
    res.status(201).json({ 
        message: 'Rating added successfully', 
        rating: newRating, 
        average_rating: averageRating,
        total_ratings: totalRatings 
    });

  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// GET /ratings/:composerId - Get a user's rating for a specific composer
router.get('/:composerId', async (req, res) => {
  try {
    const { composerId } = req.params;
    const ip_address = req.ip;

    if (!composerId) {
      return res.status(400).json({ error: 'Composer ID is required.' });
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        composerId_ip_address: {
          composerId: parseInt(composerId),
          ip_address: ip_address,
        },
      },
    });

    if (existingRating) {
      res.status(200).json(existingRating);
    } else {
      res.status(404).json({ error: 'Rating not found for this composer and user.' });
    }

  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = { router, setPrismaClient };
