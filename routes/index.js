const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const filepath = path.join(__dirname, 'letters/sender-data.json');
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.render('index');
    } else {
      try{
        data = JSON.parse(data).senderList;
        res.render('index', { letterData: data });
      } catch (e) {
        res.render('index');
      }

    }
  });
});

router.post('/letter', function(req, res, next) {
  const senderFilepath = path.join(__dirname, 'letters/sender-data.json');
  fs.readFile(senderFilepath, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Internal Server Error' });
    } else {
      try {
        const { sender, content } = req.body;
        let senderData = JSON.parse(data);
        senderData.senderList.push(sender);

        const letterFilPath = path.join(__dirname, `letters/letter-${Date.now()}.json`);
        let letterData = {
          sender : sender,
          content : content,
          createAt : new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
        };
        senderData = JSON.stringify(senderData);
        letterData = JSON.stringify(letterData);

        fs.writeFile(letterFilPath, letterData, (err) => {
          if (err) {
            console.error(err);
            res.status(500).send({ message: 'Internal Server Error' });
          } else {
            fs.writeFile(senderFilepath, senderData, (err) => {
              if (err) {
                console.error(err);
                res.status(500).send({ message: 'Internal Server Error' });
              } else {
                res.send({ message: 'Letter saved' });
              }
            });
          }
        });
      }catch (e) {
        console.error(e);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    }
  });
});


module.exports = router;
