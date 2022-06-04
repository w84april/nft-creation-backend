const axios = require("axios");
const prettier = require("prettier");
require("dotenv").config();
const fs = require("fs");
const path = "./nft-metadata.json";
const FormData = require("form-data");
const { PINATA_API_KEY, PINATA_SECRET_KEY } = process.env;
const pinataSDK = require("@pinata/sdk");
const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);
let metadataFormdata = new FormData();
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; 
}
module.exports = pinFileToIPFS = (filePath) => {
  return new Promise(async (resolve) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    console.log("pinfile");

    //we gather a local file for this example, but any valid readStream source will work here.
    let data = new FormData();
    data.append("file", fs.createReadStream(filePath));

    //You'll need to make sure that the metadata is in the form of a JSON object that's been convered to a string
    //metadata is optional
    const metadata = JSON.stringify({
      name: `testname${getRandomInt(1, 100)}`,
      keyvalues: {
        exampleKey: "exampleValue",
      },
    });
    data.append("pinataMetadata", metadata);

    //pinataOptions are optional
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
      customPinPolicy: {
        regions: [
          {
            id: "FRA1",
            desiredReplicationCount: 1,
          },
          {
            id: "NYC1",
            desiredReplicationCount: 2,
          },
        ],
      },
    });
    data.append("pinataOptions", pinataOptions);

    const pinJSONToIPFS = async () => {
      pinata
        .pinFromFS(path)
        .then((result) => {
          //handle results here
          console.log(result);
          resolve(result.IpfsHash);
        })
        .catch((err) => {
          //handle error here
          console.log(err);
        });
    };

    const sendImage = async () => {
      console.log("sendImage");

      axios
        .post(url, data, {
          maxBodyLength: "Infinity", //this is needed to prevent axios from erroring out with large files
          headers: {
            "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
          },
        })
        .then(function (response) {
          console.log(response, '@@#@');
          fs.writeFileSync(
            path,
            `{ "attributes": [ { "trait_type":  "Breed", "value": "Maltipoo" }, { "trait_type": "Eye color", "value": "Mocha" }], "description": "The world's most adorable and sensitive pup.", "image": "https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}", "name": "Ramses" }`,
          );
          console.log('!@@@2131!', path);
          const readStream = fs.createReadStream(path);
          console.log('@@@@', readStream);
          metadataFormdata.append("file", path);
          pinJSONToIPFS()
              .then(res => console.log('METADATA', res))
              .catch(err => console.log("ERR METDATA", err));
          console.log(response);
          console.log("sent image and written json");
        })
        .catch(function (error) {
          console.log("error:", error);
        });
    };
    sendImage()
        .then(res => console.log('!!!', res))
        .catch(err => console.log(err));
  });
};
