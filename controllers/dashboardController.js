const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'Customer' });
    const totalAdmins = await User.countDocuments({ role: 'Admin' });
    const activeUsers = await User.countDocuments({ status: 'Active' });
    const blockedUsers = await User.countDocuments({ status: 'Blocked' });

    // Product statistics
    const totalProducts = await Product.countDocuments();
    const featuredProducts = await Product.countDocuments({ featured: true });
    const activeProducts = await Product.countDocuments({ status: 'Active' });
    const inactiveProducts = await Product.countDocuments({ status: 'Inactive' });
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10, $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const packedOrders = await Order.countDocuments({ status: 'Packed' });
    const shippedOrders = await Order.countDocuments({ status: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });
    const returnedOrders = await Order.countDocuments({ status: 'Returned' });
    const refundedOrders = await Order.countDocuments({ status: 'Refunded' });

    // Revenue calculation (from delivered orders only)
    const deliveredOrdersData = await Order.find({ status: 'Delivered' });
    const totalRevenue = deliveredOrdersData.reduce((sum, order) => sum + (order.grandTotal || order.totalAmount || 0), 0);
    const totalSales = deliveredOrdersData.length;

    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = await Order.countDocuments({
      status: 'Delivered',
      createdAt: { $gte: today }
    });
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          status: 'Delivered',
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    // Monthly sales
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlySales = await Order.countDocuments({
      status: 'Delivered',
      createdAt: { $gte: monthStart }
    });
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: 'Delivered',
          createdAt: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    // Yearly sales
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearlySales = await Order.countDocuments({
      status: 'Delivered',
      createdAt: { $gte: yearStart }
    });
    const yearlyRevenue = await Order.aggregate([
      {
        $match: {
          status: 'Delivered',
          createdAt: { $gte: yearStart }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$grandTotal' }
        }
      }
    ]);

    // Coupon statistics
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ status: 'Active' });

    // Payment statistics
    const totalPayments = await Payment.countDocuments();
    const successfulPayments = await Payment.countDocuments({ status: 'Success' });
    const failedPayments = await Payment.countDocuments({ status: 'Failed' });
    const pendingPayments = await Payment.countDocuments({ status: 'Pending' });

    // Recent orders (last 10)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .populate('items.id', 'title');

    // Recent users (last 10)
    const recentUsers = await User.find()
      .select('-password')
      .sort({ registrationDate: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          admins: totalAdmins,
          active: activeUsers,
          blocked: blockedUsers
        },
        products: {
          total: totalProducts,
          featured: featuredProducts,
          active: activeProducts,
          inactive: inactiveProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          packed: packedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
          returned: returnedOrders,
          refunded: refundedOrders
        },
        revenue: {
          total: totalRevenue,
          totalSales: totalSales,
          today: {
            sales: todaySales,
            revenue: todayRevenue[0]?.total || 0
          },
          monthly: {
            sales: monthlySales,
            revenue: monthlyRevenue[0]?.total || 0
          },
          yearly: {
            sales: yearlySales,
            revenue: yearlyRevenue[0]?.total || 0
          }
        },
        coupons: {
          total: totalCoupons,
          active: activeCoupons
        },
        payments: {
          total: totalPayments,
          successful: successfulPayments,
          failed: failedPayments,
          pending: pendingPayments
        },
        recentOrders,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Get monthly sales chart data
 * @route   GET /api/dashboard/charts/sales
 * @access  Private/Admin
 */
exports.getMonthlySalesChart = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const monthlyData = await Order.aggregate([
      {
        $match: {
          status: 'Delivered',
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          sales: { $sum: '$grandTotal' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing months with 0
    const chartData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyData.find(d => d._id === i + 1);
      return {
        month: i + 1,
        sales: monthData?.sales || 0,
        orders: monthData?.orders || 0
      };
    });

    res.status(200).json({
      success: true,
      data: { chartData }
    });
  } catch (error) {
    console.error('Get monthly sales chart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Get category sales chart data
 * @route   GET /api/dashboard/charts/categories
 * @access  Private/Admin
 */
exports.getCategorySalesChart = async (req, res) => {
  try {
    const categoryData = await Order.aggregate([
      {
        $match: { status: 'Delivered' }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $group: {
          _id: '$product.category',
          sales: { $sum: '$items.totalPrice' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { sales: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: { categoryData }
    });
  } catch (error) {
    console.error('Get category sales chart error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
