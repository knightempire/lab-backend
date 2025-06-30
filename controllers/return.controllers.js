//controllers/return.controllers.js
const Requests = require('../models/requests.model');
const Products = require('../models/product.model');
const moment = require('moment-timezone');
const { deleteRowbyReqID } = require('../middleware/googlesheet');
const { sendUserReturnEmail } = require('../middleware/mail/mail');


const returnProducts = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { productName, returnQuantity, returnDate, damagedQuantity, userDamagedQuantity, replacedQuantity, description } = req.body;

        // Validate requestId
        if (!requestId || typeof requestId !== 'string' || !/^REQ-[FS]-\d{2}\d{4}$/.test(requestId)) {
            return res.status(400).json({ message: 'Invalid requestId format' });
        }
        // Validate productName
        if (!productName || typeof productName !== 'string') {
            return res.status(400).json({ message: 'Invalid productName' });
        }
        // Validate returnQuantity
        if (typeof returnQuantity !== 'number' || returnQuantity < 1) {
            return res.status(400).json({ message: 'Invalid returnQuantity' });
        }

        if (description && typeof description !== 'string') {
            return res.status(400).json({ message: 'Invalid description' });
        }

        // Find the product by name
        const product = await Products.findOne({ product_name: productName });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const issuedProductId = product._id.toString();

        // Fetch the request by requestId
        const request = await Requests.findOne({ requestId });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.requestStatus !== 'approved' && request.requestStatus !== 'reIssued') {
            return res.status(400).json({ message: 'Request is not approved' });
        }

        // Find the issued item by issuedProductId
        const issuedItem = request.issued.find(
            (item) => item.issuedProductId.toString() === issuedProductId
        );

        if (!issuedItem) {
            return res.status(404).json({ message: 'Issued product not found in this request' });
        }

        const totalReturned = issuedItem.return.reduce((sum, r) => sum + (r.returnedQuantity - r.replacedQuantity), 0);

        if (returnQuantity + totalReturned > issuedItem.issuedQuantity) {
            return res.status(400).json({ message: 'Return quantity exceeds issued quantity' });
        }

        issuedItem.return.push({
            returnedQuantity: returnQuantity,
            returnDate: returnDate || new Date(),
            damagedQuantity: damagedQuantity || 0,
            userDamagedQuantity: userDamagedQuantity || 0,
            replacedQuantity: replacedQuantity || 0,
            description: description || null
        });

        let status = 201;
        for (const item of request.issued) {
            const returned = item.return.reduce((sum, r) => sum + (r.returnedQuantity - r.replacedQuantity), 0);
            if (returned < item.issuedQuantity) {
                status = 200;
                break;
            }
        }

        let populatedRequest;

        if (status === 201) {
            request.requestStatus = 'returned';
            request.AllReturnedDate = moment.tz("Asia/Kolkata").toDate();

            // Save the request before populating
            await request.save();

            // Populate product name for response and get user details for email
            populatedRequest = await Requests.findOne({ requestId })
                .populate('userId', 'name email')
                .populate('issued.issuedProductId', 'name');

            // Send return notification email to user
            if (populatedRequest?.userId?.email) {
                const userEmail = populatedRequest.userId.email;
                const userName = populatedRequest.userId.name;
                const returnDateTime = moment.tz(returnDate || new Date(), "Asia/Kolkata").format("DD/MM/YYYY HH:mm");
                await sendUserReturnEmail(userEmail, userName, requestId, returnDateTime);
            }

            // Delete row from Google Sheet
            try {
                await deleteRowbyReqID(requestId);
            } catch (sheetErr) {
                console.error('Error deleting row from Google Sheet:', sheetErr);
            }
        } else {
            // Save the request before populating
            await request.save();

            // Populate product name for response
            populatedRequest = await Requests.findOne({ requestId })
                .populate('issued.issuedProductId', 'name');
        }

        // Calculate how much to add to inStock and damagedQuantity
        const addToStock = returnQuantity - (damagedQuantity || 0) - (replacedQuantity || 0);
        const addToDamaged = damagedQuantity || 0; // Only damaged, not replaced

        // Only update what is needed
        const updateObj = {};
        if (addToStock > 0) updateObj.inStock = addToStock;
        if (addToDamaged > 0) updateObj.damagedQuantity = addToDamaged;
        if (replacedQuantity && replacedQuantity > 0) updateObj.inStock = (updateObj.inStock || 0) - replacedQuantity;

        if (Object.keys(updateObj).length > 0) {
            await Products.updateOne(
                { _id: product._id },
                { $inc: updateObj }
            );
        }

        res.status(status).json({
            status: 200,
            message: 'Product returned successfully',
            request: populatedRequest
        });
    } catch (err) {
        console.log('Error in returnProducts: ', err);
        res.status(500).json({ message: "Server error" });
    }
};

// add fetchReturn function
const fetchReturn = async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!requestId || typeof requestId !== 'string' || !/^REQ-[FS]-\d{2}\d{4}$/.test(requestId)) {
            return res.status(400).json({ message: 'Invalid requestId format' });
        }

        const request = await Requests.findOne({ requestId }).populate('issued.issuedProductId', 'name');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        const issuedWithReturns = request.issued.filter(item => item.return.length > 0);
        if (issuedWithReturns.length === 0) {
            return res.status(404).json({ message: 'No returns found for this request' });
        }

        const returnDetails = await Promise.all(
            issuedWithReturns.map(async item => {
                const productId = item.issuedProductId?._id || item.issuedProductId;
                let productName = item.issuedProductId && item.issuedProductId.name
                    ? item.issuedProductId.name
                    : null;

                if (!productName && productId) {
                    const product = await Products.findById(productId).select('name');
                    productName = product ? product.name : null;
                }

                const totalReturned = item.return.reduce((sum, r) => sum + r.returnedQuantity, 0);
                const totalReplaced = item.return.reduce((sum, r) => sum + r.replacedQuantity, 0);
                const totalDamaged = item.return.reduce((sum, r) => sum + r.damagedQuantity, 0);
                const totalUserDamaged = item.return.reduce((sum, r) => sum + r.userDamagedQuantity, 0);
                const remaining = item.issuedQuantity - item.return.reduce((sum, r) => sum + (r.returnedQuantity - r.replacedQuantity), 0);

                return {
                    issuedProductId: productId,
                    issuedProductName: productName,
                    issuedQuantity: item.issuedQuantity,
                    totalReturned,
                    remaining,
                    replacedQuantity: totalReplaced,
                    damagedQuantity: totalDamaged,
                    userDamagedQuantity: totalUserDamaged,
                    returns: item.return
                };
            })
        );

        res.status(200).json({
            status: 200,
            message: "Request's return fetched successfully",
            return: returnDetails
        });
    } catch (err) {
        console.log('Error in fetchReturn: ', err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { returnProducts, fetchReturn };