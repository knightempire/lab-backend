const Requests = require('../../models/requests.model');
const Products = require('../../models/product.model');
const ReIssued = require('../../models/reIssued.model');
const moment = require("moment-timezone");

const getTotalRequests = async (req, res) => {
    try {
        const totalCount = await Requests.countDocuments();
        return res.status(200).json({
            status: 200,
            totalRequests: totalCount
        });
    } catch (err) {
        console.error('Error in getTotalRequests:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getActiveRequests = async (req, res) => {
    try {
        const activeCount = await Requests.countDocuments({ 
            requestStatus: "approved" 
        });
        return res.status(200).json({
            status: 200,
            activeRequests: activeCount
        });
    } catch (err) {
        console.error('Error in getActiveRequests:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getPendingRequests = async (req, res) => {
    try {
        const pendingCount = await Requests.countDocuments({ 
            requestStatus: "pending" 
        });
        return res.status(200).json({
            status: 200,
            pendingRequests: pendingCount
        });
    } catch (err) {
        console.error('Error in getPendingRequests:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getOverdueReturns = async (req, res) => {
    try {
        const today = moment.tz("Asia/Kolkata").startOf('day').toDate();
        console.log('DEBUG: Today is', today);

        const overdueRequests = await Requests.find({
            requestStatus: { $in: ["approved", "reIssued"] },
            issuedDate: { $exists: true, $ne: null },
            AllReturnedDate: null
        });

        console.log('DEBUG: Found', overdueRequests.length, 'potential overdue requests');

        let overdueList = [];

        for (let request of overdueRequests) {
            console.log('DEBUG: Checking requestId:', request.requestId);
            if (request.collectedDate && request.adminApprovedDays) {
                // Find the latest re-issue for this requestId (if any)
                const latestReIssue = await ReIssued.findOne(
                    { requestId: request.requestId, adminApprovedDays: { $ne: null } }
                ).sort({ reIssuedDate: -1 });

                const reIssueDays = latestReIssue ? latestReIssue.adminApprovedDays : 0;
                const totalDays = request.adminApprovedDays + reIssueDays;
                const dueDate = moment(request.collectedDate).add(totalDays, 'days').toDate();


                if (dueDate < today) {
                    overdueList.push({
                        requestId: request.requestId,
                        date: moment(dueDate).tz("Asia/Kolkata").format("DD/MM/YYYY")
                    });
                } 
            } else {
                console.log(`DEBUG: requestId=${request.requestId} missing collectedDate or adminApprovedDays`);
            }
        }

        return res.status(200).json({
            status: 200,
            overdueReturns: overdueList.length,
            overdueRequests: overdueList
        });
    } catch (err) {
        console.error('Error in getOverdueReturns:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};
const getLowStockItems = async (req, res) => {
    try {
        const lowStockItems = await Products.find({ 
            inStock: { $lt: 10 },
            isDisplay: true 
        }).select('product_name inStock');
        
        return res.status(200).json({
            status: 200,
            lowStockItems: lowStockItems
        });
    } catch (err) {
        console.error('Error in getLowStockItems:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getRequestCountByMonth = async (req, res) => {
    try {
        const requestCountByMonth = await Requests.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$requestDate" },
                        month: { $month: "$requestDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1
                }
            }
        ]);

        return res.status(200).json({
            status: 200,
            requestCountByMonth: requestCountByMonth
        });
    } catch (err) {
        console.error('Error in getRequestCountByMonth:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getInventoryDistribution = async (req, res) => {
    try {
        const inventoryStats = await Products.aggregate([
            {
                $match: { isDisplay: true }
            },
            {
                $group: {
                    _id: null,
                    totalInStock: { $sum: "$inStock" },
                    totalDamaged: { $sum: "$damagedQuantity" },
                    totalYetToGive: { $sum: "$yetToGive" }
                }
            },
            {
                $project: {
                    _id: 0,
                    inStock: "$totalInStock",
                    damaged: "$totalDamaged",
                    yetToGive: "$totalYetToGive"
                }
            }
        ]);

        const distribution = inventoryStats.length > 0 ? inventoryStats[0] : {
            inStock: 0,
            damaged: 0,
            yetToGive: 0
        };

        return res.status(200).json({
            status: 200,
            inventoryDistribution: distribution
        });
    } catch (err) {
        console.error('Error in getInventoryDistribution:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getTopComponents = async (req, res) => {
    try {
        const topComponents = await Requests.aggregate([
            { $unwind: "$requestedProducts" },
            {
                $group: {
                    _id: "$requestedProducts.productId",
                    totalRequested: { $sum: "$requestedProducts.quantity" },
                    requestCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            {
                $project: {
                    _id: 0,
                    productName: "$productInfo.product_name",
                    totalRequested: 1,
                    requestCount: 1
                }
            },
            { $sort: { totalRequested: -1 } },
            { $limit: 10 }
        ]);

        return res.status(200).json({
            status: 200,
            topComponents: topComponents
        });
    } catch (err) {
        console.error('Error in getTopComponents:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getStatusBreakdown = async (req, res) => {
    try {
        const statusBreakdown = await Requests.aggregate([
            {
                $group: {
                    _id: "$requestStatus",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1
                }
            }
        ]);

        return res.status(200).json({
            status: 200,
            statusBreakdown: statusBreakdown
        });
    } catch (err) {
        console.error('Error in getStatusBreakdown:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getAdminReminder = async (req, res) => {
    try {
        const today = moment.tz("Asia/Kolkata").startOf('day');
        const tomorrow = moment.tz("Asia/Kolkata").add(1, 'day').startOf('day');
        const twoDaysFromNow = moment.tz("Asia/Kolkata").add(2, 'days').startOf('day');

        const upcomingCollections = await Requests.find({
            scheduledCollectionDate: {
                $gte: today.toDate(),
                $lt: twoDaysFromNow.toDate()
            },
            requestStatus: "approved",
            collectedDate: null
        }).select('requestId scheduledCollectionDate');

        const upcomingReturns = await Requests.find({
            requestStatus: "approved",
            issuedDate: { $exists: true, $ne: null },
            AllReturnedDate: null,
            adminApprovedDays: { $exists: true, $ne: null }
        });

        const returnsArray = [];
        
        for (let request of upcomingReturns) {
            if (request.issuedDate && request.adminApprovedDays) {
                const returnDueDate = moment(request.issuedDate).add(request.adminApprovedDays, 'days');
                
                if (returnDueDate.isBetween(today, twoDaysFromNow, null, '[)')) {
                    returnsArray.push({
                        requestId: request.requestId,
                        returnDueDate: returnDueDate.toDate()
                    });
                }
            }
        }

        return res.status(200).json({
            status: 200,
            upcomingCollections: upcomingCollections,
            upcomingReturns: returnsArray
        });
    } catch (err) {
        console.error('Error in getAdminReminder:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTotalRequests,
    getActiveRequests,
    getPendingRequests,
    getOverdueReturns,
    getLowStockItems,
    getRequestCountByMonth,
    getInventoryDistribution,
    getTopComponents,
    getStatusBreakdown,
    getAdminReminder
};