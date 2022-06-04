const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const request = require('request');
const bodyParser = require('body-parser');
const pinFileToIPFS = require("./pinata/send.js");
const mintNFT = require("./scripts/mint-nft.js");
const imageToBase64 = require('image-to-base64');

const app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());

app.post('/link', async(req, res) => {
  const { description, url } = req.body;

  if(!url && !description) {
    throw 'UNDEFINED';
  }
  const obj = {
    url,
    description
  }
  fs.writeFile(`file.json`, JSON.stringify(obj), (err, data) => {
    if (err) throw err;
    console.log('OK');
    res.send('OK');
  })
});

app.get('/', async () => {
  let link = '';
  const downloadImage = async (url, filename, callback) => {
    return await request.head(url, (err, res, body) => {
      request(url).pipe(fs.createWriteStream(filename)).on('close', callback);
    })
  }
  fs.readFile(`file.json`, (err, data) => {
    if(err) throw err;
    link = JSON.parse(data).url;
    link = link + '.png';
    console.log(link);
    downloadImage(link, `image.png`, () => console.log('HI')).then(res => {
      imageToBase64(`image.png`).then(
          (response) => {
            const base64 = response.split(';base64,').pop();
            fs.writeFile('currentNFTimage.png', base64, {encoding: 'base64'}, (err, data) => {
              if (err) throw err;
              uploadNft('currentNFTimage.png');
            })
          }
      )
    });
  });
})

app.get('/getImages', async(req, res) => {
  let description = '';
  let img = '';
    imageToBase64(`image.png`).then(
        (response) => {
          console.log(response);
          img = response;
          fs.readFile(`image.png`, (err, data) => {
            if (err) throw err;
            fs.readFile(`file.json`, (err, data) => {
              if(err) throw err;
              description = JSON.parse(data).description;
              const obj = {
                img,
                description
              }
              res.json(obj);
            })
          })
        },
        (error) => {
          if (error) throw 'NO SUCH FILE IMAGE OR META'
        }
    )
})

app.post('/nft', async(req, res) => {
  console.log('DATA', req.body);
  const { img } = req.body;
  console.log('URL', img);
  if(!img) {
    throw 'No image';
  }
  const base64 = img.split(';base64,').pop();;
  console.log(base64);
  fs.writeFile('currentNFTimage.png', base64, {encoding: 'base64'}, (err, data) => {
    if (err) throw err;
    uploadNft('currentNFTimage.png');
  })
});

const uploadNft = async (img) => {
  try {
    pinFileToIPFS(img).then(async (res) => {
      console.log(res);
      console.log("waiting for 5 sec");
      mintNFT(res);
      console.log("SUCCESS");
    });
  } catch (err) {
    console.log(err);
  }
};


app.listen(process.env.PORT || 3000, () => console.log('START'));
