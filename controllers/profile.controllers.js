//controllers/profile.controllers.js
const Users = require('../models/user.model');
const Requests = require('../models/requests.model');
const ReIssued = require('../models/reIssued.model');
const moment = require('moment-timezone');

const updateUser = async (req, res) => {
    try {
        const { rollNo } = req.body;

        const fieldMap = {
            userName: 'name',
            userPhoneNo: 'phoneNo'
        };

        console.log(req.body);

        const updates = {};
        for (let key in fieldMap) {
            if (req.body[key] !== undefined) {
                updates[fieldMap[key]] = req.body[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                status: 400,
                message: 'No valid fields provided to update',
            });
        }

        const updatedUser = await Users.findOneAndUpdate(
            { rollNo },
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: `User with rollNo: ${rollNo} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'User updated successfully',
            user: updatedUser,
        });
    } catch (err) {
        console.error('Error in updateUser:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

const fetchUser = async (req, res) => {
    try {
        const { rollNo } = req.body;

   const user = await Users.findOne({ rollNo }).select('-password');

        if (!user) {
            return res.status(404).json({ message: `User with rollNo: ${rollNo} doesn't exist.` });
        }

        const requests = await Requests.find({ userId: user._id });

        const requestsCount = requests.length;
        const damagedItemsCount = requests.reduce((total, request) => {
            return total + request.issued.reduce((sum, issuedItem) => {
                return sum + issuedItem.return.reduce((rSum, rItem) => {
                    return rSum + (rItem.userDamagedQuantity || 0);
                }, 0);
            }, 0);
        }, 0);

        return res.status(200).json({
            status: 200,
            message: 'User fetched successfully',
            user: user,
            stats: {
                requestsCount: requestsCount,
                damagedItemsCount: damagedItemsCount,
            }
        });
    } catch (err) {
        console.error('Error in fetchUser:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

const userStats = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: `User with email: ${email} doesn't exist.` });
        }

        // Fetch all requests for this user
        const requests = await Requests.find({ userId: user._id }).lean();

        // --- Collection Dates ---
        const collectionDate = requests
            .filter(req => req.scheduledCollectionDate)
            .map(req => {
                const sched = moment.tz(req.scheduledCollectionDate, "DD/MM/YYYY HH:mm", "Asia/Kolkata");
                return {
                    requestId: req.requestId,
                    date: sched.isValid() ? sched.toDate() : null,
                    isCollected: !!req.collectedDate,
                    collectedDate: req.collectedDate || null,
                    requestStatus: req.requestStatus
                };
            });

        // --- Returns ---
        // Only requests that have been collected
        const returnRequests = requests.filter(req => req.collectedDate);

        // Batch fetch all relevant re-issues for this user's requests
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

        const returns = [];
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

            returns.push(returnObj);
        }

        return res.status(200).json({
            status: 200,
            user: {
                name: user.name,
                email: user.email,
                rollNo: user.rollNo,
                phoneNo: user.phoneNo
            },
            collectionDate,
            returns
        });
    } catch (err) {
        console.error('Error in userStats:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { updateUser, fetchUser, userStats };