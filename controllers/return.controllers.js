//controllers/return.controllers.js
const Requests = require('../models/requests.model');

const returnProducts = async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!requestId || typeof requestId !== 'string' || !/^REQ-[FS]-\d{2}\d{4}$/.test(requestId)) {
            return res.status(400).json({ message: 'Invalid requestId format' });
        }

        const { product_name, returnQuantity, returnDate, damagedQuantity, userDamagedQuantity, replacedQuantity } = req.body;

        if (!product_name || typeof returnQuantity !== 'number' || returnQuantity < 1) {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        // Fetch the request by requestId
        const request = await Requests.findOne({ requestId });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.requestStatus !== 'approved') {
            return res.status(400).json({ message: 'Request is not approved' });
        }

        const issuedItem = request.issued.find(
            (item) => item.issuedProduct.trim().toLowerCase() === product_name.trim().toLowerCase()
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
            replacedQuantity: replacedQuantity || 0
        });

        await request.save();

        res.status(200).json({ 
            status: 200,
            message: 'Product returned successfully', 
            request
        });
    } catch (err) {
        console.log('Error in returnProducts: ', err);
        res.status(500).json({ message: "Server error" });
    }
}

// add fetchReturn function
const fetchReturn = async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!requestId || typeof requestId !== 'string' || !/^REQ-[FS]-\d{2}\d{4}$/.test(requestId)) {
            return res.status(400).json({ message: 'Invalid requestId format' });
        }

        const request = await Requests.findOne({ requestId });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        
        if (!request.issued.some(item => item.return.length > 0)) {
            return res.status(404).json({ message: 'No returns found for this request' });
        }

        const returnDetails = request.issued.map(item => {
            const totalReturned = item.return.reduce((sum, r) => sum + r.returnedQuantity, 0);
            const totalReplaced = item.return.reduce((sum, r) => sum + r.replacedQuantity, 0);
            const totalDamaged = item.return.reduce((sum, r) => sum + r.damagedQuantity, 0);
            const totalUserDamaged = item.return.reduce((sum, r) => sum + r.userDamagedQuantity, 0);
            const remaining = item.issuedQuantity - item.return.reduce((sum, r) => sum + (r.returnedQuantity - r.replacedQuantity), 0);                  

            return {
                issuedProduct: item.issuedProduct,
                issuedQuantity: item.issuedQuantity,
                totalReturned,
                remaining,
                replacedQuantity: totalReplaced,
                damagedQuantity: totalDamaged,
                userDamagedQuantity: totalUserDamaged,
                returns: item.return
            };
        });

        res.status(200).json({
            status: 200,
            message: "Request's return fetched successfully",
            return: returnDetails
        });
    } catch (err) {
        console.log('Error in fetchReturn: ', err);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = { returnProducts, fetchReturn };