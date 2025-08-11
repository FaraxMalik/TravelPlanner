const express = require('express');
const router = express.Router();
const {
  createTour,
  getUserTours
} = require('../controllers/tourController');
const { protect } = require('../middlewares/authMiddleware');

// All tour routes are protected
router.use(protect);

// Tour routes
router.post('/create', createTour);
router.get('/myplans', getUserTours);

module.exports = router; 