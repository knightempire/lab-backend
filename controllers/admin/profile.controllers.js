//controllers/admin/users.controllers.js
const Users = require('../../models/user.model');
const Requests = require('../../models/requests.model');

const adminUpdateUser = async (req, res) => {
    try {
        const { rollNo } = req.params;

        if (!rollNo) {
            return res.status(400).json({
                status: 400,
                message: 'Roll number is required',
            });
        }

        const fieldMap = {
            userName: 'name',
            userEmail: 'email',
            userRollNo: 'rollNo',
            userPhoneNo: 'phoneNo',
            userIsFaculty: 'isFaculty',
            userIsAdmin: 'isAdmin',
            userIsActive: 'isActive'
        };

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

//Function to display all users
const fetchAllUsers = async (req, res) => {
    try {
        //Fetch all Users
        const userData = await Users.find();

        let text = 'Users fetched successfully';

        //No user to display
        if (userData.length === 0) {
            text = 'No User data to Display';
        }

        //Send the Users details
        return res.status(200).json({
            status: 200,
            message: text,
            users: userData.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                rollNo: user.rollNo,
                phoneNo: user.phoneNo,
                isFaculty: user.isFaculty,
                isAdmin: user.isAdmin,
                isActive: user.isActive,
            })),
        });
    } catch (err) {
        console.error('Error in fetchAllUsers:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

//Function to display a user
const adminFetchUser = async (req, res) => {
    try {
        const { rollNo } = req.params;

        if (!rollNo) {
            return res.status(400).json({
                status: 400,
                message: 'Roll number is required.',
            });
        }

        const user = await Users.findOne({ rollNo });

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
            user: {name: user.name, email: user.email, rollNo: user.rollNo, phoneNo: user.phoneNo },
            requestsCount: requestsCount,
            damagedItemsCount: damagedItemsCount
        });
    } catch (err) {
        console.error('Error in fetchUser:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

//Function to fetch users with pagination and filters (5 users per page)
const userFetchOptimal = async (req, res) => {
    try {
        const { pageno } = req.params;
        const { role, status } = req.query;
        
        // Validate page number
        const pageNumber = parseInt(pageno);
        if (!pageNumber || pageNumber < 1) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid page number. Page number must be a positive integer.',
            });
        }

        const usersPerPage = 5;
        const skip = (pageNumber - 1) * usersPerPage;

        // Build filter object based on query parameters
        const filter = {};
        
        // Role filter
        if (role && role !== 'All') {
            if (role === 'Faculty') {
                filter.isFaculty = true;
            } else if (role === 'Student') {
                filter.isFaculty = false;
            }
        }
        
        // Status filter
        if (status && status !== 'All') {
            if (status === 'Active') {
                filter.isActive = true;
            } else if (status === 'Inactive') {
                filter.isActive = false;
            }
        }

        // Get total count of users with filters for pagination info
        const totalUsers = await Users.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / usersPerPage);

        // Fetch users with pagination and filters
        const userData = await Users.find(filter)
            .skip(skip)
            .limit(usersPerPage)
            .select('_id name email rollNo phoneNo isFaculty isAdmin isActive')
            .sort({ name: 1 }); // Sort by name for consistent ordering

        let message = 'Users fetched successfully';
        
        // Check if page number exceeds total pages
        if (pageNumber > totalPages && totalUsers > 0) {
            return res.status(404).json({
                status: 404,
                message: `Page ${pageNumber} not found. Total pages available: ${totalPages}`,
            });
        }

        // No users to display
        if (userData.length === 0 && totalUsers === 0) {
            message = 'No User data to Display';
        }

        // Build applied filters info
        const appliedFilters = {
            role: role || 'All',
            status: status || 'All'
        };

        // Send the paginated users details
        return res.status(200).json({
            status: 200,
            message: message,
            filters: appliedFilters,
            pagination: {
                currentPage: pageNumber,
                totalPages: totalPages,
                totalUsers: totalUsers,
                usersPerPage: usersPerPage,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1
            },
            users: userData.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                rollNo: user.rollNo,
                phoneNo: user.phoneNo,
                isFaculty: user.isFaculty,
                isAdmin: user.isAdmin,
                isActive: user.isActive,
                role: user.isFaculty ? 'Faculty' : 'Student',
                statusText: user.isActive ? 'Active' : 'Inactive'
            })),
        });
    } catch (err) {
        console.error('Error in userFetchOptimal:', err);
        return res.status(500).json({ 
            status: 500,
            message: 'Server error' 
        });
    }
};

module.exports = { adminUpdateUser, adminFetchUser, fetchAllUsers, userFetchOptimal };
