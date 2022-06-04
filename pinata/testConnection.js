const axios = require("axios");
require("dotenv").config();

const { PINATA_API_KEY, PINATA_SECRET_KEY } = process.env;
const testAuthentication = () => {
  const url = `https://api.pinata.cloud/data/testAuthentication`;
  return axios
    .get(url, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
};
testAuthentication();
