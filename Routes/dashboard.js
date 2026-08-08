const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats,
  getMonthlySalesChart,
  getCategorySalesChart
} = require('../controllers/dashboardController');

const router = express.Router();

// route   GET /api/dashboard/stats
// desc    Get dashboard statistics
// access  Private/Admin
router.get('/stats', protect, adminOnly, getDashboardStats);

// route   GET /api/dashboard/charts/sales
// desc    Get monthly sales chart data
// access  Private/Admin
router.get('/charts/sales', protect, adminOnly, getMonthlySalesChart);

// route   GET /api/dashboard/charts/categories
// desc    Get category sales chart data
// access  Private/Admin
router.get('/charts/categories', protect, adminOnly, getCategorySalesChart);

module.exports = router;
