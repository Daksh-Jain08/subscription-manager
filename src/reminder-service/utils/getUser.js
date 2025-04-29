const axios = require("axios");

const getUser = async (userId) => {
    try {
        const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/auth/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

const getSubscription = async (subId) => {
    try {
        const response = await axios.get(`${process.env.SUB_SERVICE_URL}/api/subscription/${subId}`)
        return response.data;
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
    }
}

module.exports = { getUser, getSubscription };