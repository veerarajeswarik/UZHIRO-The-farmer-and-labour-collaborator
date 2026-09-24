const asyncHandler = require('express-async-handler');
const User = require('../../models/User');
const Crop = require('../../models/Crop');
const Product = require('../../models/Product');
const HiringRequest = require('../../models/HiringRequest');
const LearningArticle = require('../../models/LearningArticle');
const GovernmentScheme = require('../../models/GovernmentScheme');
const FarmTask = require('../../models/FarmTask');
const MarketPrice = require('../../models/MarketPrice');
const { sendSuccess } = require('../../utils/apiResponse');

// GET /api/admin/reports - real aggregate counts, computed live from the
// database on every request. Never a fabricated/static figure.
const getReports = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalFarmers,
    totalLabourers,
    totalAdmins,
    activeUsers,
    inactiveUsers,
    totalCrops,
    totalProducts,
    totalLearningArticles,
    totalSchemes,
    totalFarmTasks,
    totalMarketPriceRecords,
    hiringByStatus,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'farmer' }),
    User.countDocuments({ role: 'labourer' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    Crop.countDocuments(),
    Product.countDocuments(),
    LearningArticle.countDocuments(),
    GovernmentScheme.countDocuments(),
    FarmTask.countDocuments(),
    MarketPrice.countDocuments(),
    HiringRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const hiringStatusCounts = { Pending: 0, Accepted: 0, Rejected: 0, Cancelled: 0, Completed: 0 };
  hiringByStatus.forEach((row) => {
    hiringStatusCounts[row._id] = row.count;
  });

  sendSuccess(res, 200, {
    users: { total: totalUsers, farmers: totalFarmers, labourers: totalLabourers, admins: totalAdmins, active: activeUsers, inactive: inactiveUsers },
    content: { crops: totalCrops, products: totalProducts, learningArticles: totalLearningArticles, schemes: totalSchemes },
    activity: { farmTasks: totalFarmTasks, marketPriceRecords: totalMarketPriceRecords, hiringRequestsByStatus: hiringStatusCounts },
    generatedAt: new Date().toISOString(),
  });
});

module.exports = { getReports };
