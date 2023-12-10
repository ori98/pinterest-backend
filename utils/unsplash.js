const axios = require("axios");

const ACCESS_KEY = 'mQJLaSiZ3OyPklzNq-VRNupC5TBybCJymPKajA0QHfY';
const BASE_URL = 'https://api.unsplash.com';

exports.randomPhoto = async function() {
    try {
        const response = await axios.get(`${BASE_URL}/photos/random`, {
            headers: {
                Authorization: `Client-ID ${ACCESS_KEY}`,
            },
            params: {
                count: 1,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching data from Unsplash:', error.message);
        throw error;
    }
}

exports.categoryPhotos = async function(term) {
    try {
        const response = await axios.get(`${BASE_URL}/search/photos`, {
            headers: {
                Authorization: `Client-ID ${ACCESS_KEY}`,
            },
            params: {
                query: term
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching data from Unsplash:', error.message);
        throw error;
    }
}