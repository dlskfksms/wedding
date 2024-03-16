const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const filepath = path.join(__dirname, 'letters/letter-data.json');
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
  const filepath = path.join(__dirname, 'letters/letter-data.json');
  fs.readFile(filepath, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send({ message: 'Internal Server Error' });
    } else {
      const { sender, content } = req.body;
      let letterData = JSON.parse(data);
      letterData.senderList.push(sender);
      letterData.letterList.push({
        sender : sender,
        content : content,
        createAt : new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
      });
      letterData = JSON.stringify(letterData);

      fs.writeFile(filepath, letterData, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send({ message: 'Internal Server Error' });
        } else {
          res.send({ message: 'Letter saved' });
        }
      });
    }
  });
});


module.exports = router;
