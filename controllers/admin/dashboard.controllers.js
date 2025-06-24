const Requests = require('../../models/requests.model');
const Products = require('../../models/product.model');
const ReIssued = require('../../models/reIssued.model');
const moment = require("moment-timezone");

const getRequestStats = async (req, res) => {
    try {
        // Aggregate all status counts
        const counts = await Requests.aggregate([
            {
                $group: {
                    _id: "$requestStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        let totalRequests = 0;
        let activeRequests = 0;
        let pendingRequests = 0;
        const statusBreakdown = [];

        counts.forEach(item => {
            totalRequests += item.count;
            if (item._id === "approved") activeRequests = item.count;
            if (item._id === "pending") pendingRequests = item.count;
            statusBreakdown.push({
                status: item._id,
                count: item.count
            });
        });

        return res.status(200).json({
            status: 200,
            totalRequests,
            activeRequests,
            pendingRequests,
            statusBreakdown
        });
    } catch (err) {
        console.error('Error in getRequestStats:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};


const getOverdueReturns = async (req, res) => {
    try {
        const today = moment.tz("Asia/Kolkata").startOf('day').toDate();

        const overdueRequests = await Requests.find({
            requestStatus: { $in: ["approved", "reIssued"] },
            issuedDate: { $exists: true, $ne: null },
            AllReturnedDate: null
        });

        let overdueList = [];

        for (let request of overdueRequests) {
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
                        date: dueDate
                    });
                }
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



const getAdminReminder = async (req, res) => {
    try {
        // Use lean for faster reads
        const allCollectionsRaw = await Requests.find({
            scheduledCollectionDate: { $ne: null }
        }).select('requestId scheduledCollectionDate collectedDate requestStatus').lean();

        const collectionDate = allCollectionsRaw.map(req => {
            const sched = moment.tz(req.scheduledCollectionDate, "DD/MM/YYYY HH:mm", "Asia/Kolkata");
            return {
                requestId: req.requestId,
                date: sched.isValid() ? sched.toDate() : null,
                isCollected: !!req.collectedDate,
                collectedDate: req.collectedDate || null,
                requestStatus: req.requestStatus
            };
        });

        // Use lean for returns
        const returnRequests = await Requests.find({
            collectedDate: { $ne: null }
        }).select('requestId collectedDate adminApprovedDays AllReturnedDate requestStatus').lean();

        // Batch fetch all relevant re-issues
        const requestIds = returnRequests.map(r => r.requestId);
        const allReIssues = await ReIssued.find({
            requestId: { $in: requestIds },
            adminApprovedDays: { $ne: null }
        }).sort({ reIssuedDate: -1 }).lean();

        // Map latest re-issue per requestId
        const latestReIssueMap = {};
        for (const re of allReIssues) {
            if (!latestReIssueMap[re.requestId]) {
                latestReIssueMap[re.requestId] = re;
            }
        }

        const returnsArray = [];
        for (let request of returnRequests) {
            const latestReIssue = latestReIssueMap[request.requestId];
            const reIssueDays = latestReIssue ? latestReIssue.adminApprovedDays : 0;
            const totalDays = (request.adminApprovedDays || 0) + (reIssueDays || 0);

            const dueDate = moment(request.collectedDate).add(totalDays, 'days').toDate();
            const isReturned = !!request.AllReturnedDate;

            const returnObj = {
                requestId: request.requestId,
                date: dueDate,
                isReturned: isReturned,
                requestStatus: request.requestStatus
            };

            if (isReturned) {
                returnObj.returnedDate = request.AllReturnedDate;
            }

            returnsArray.push(returnObj);
        }

        return res.status(200).json({
            status: 200,
            collectionDate: collectionDate,
            returns: returnsArray
        });
    } catch (err) {
        console.error('Error in getAdminReminder:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getRequestStats,
    getOverdueReturns,
    getLowStockItems,
    getRequestCountByMonth,
    getInventoryDistribution,
    getTopComponents,
    getAdminReminder
};