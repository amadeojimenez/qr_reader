// Middleware to extract the custom header
function extractDeviceId(req, res, next) {
    const deviceId = req.headers['x-device-id'];
    console.log('Device ID: ', deviceId);
    console.log('HEAD: ', req.headers);
    if (deviceId) {
        req.deviceId = deviceId; // Attach the deviceId to the request object
    }
    next();
}

module.exports = { extractDeviceId } ;