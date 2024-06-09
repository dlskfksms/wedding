const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

/* GET home page. */
/**
 * 청첩장 첫화면
 */
router.get("/", function (req, res, next) {
  const filepath = path.join(__dirname, "letters/sender-data.json");
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.render("index", { letterData: "" });
    } else {
      try {
        data = JSON.parse(data).senderList;
        res.render("index", { letterData: data });
      } catch (e) {
        res.render("index", { letterData: "" });
      }
    }
  });
});

/**
 * 청첩장 비공개 화면
 * (편지 상세 화면 제공)
 */
router.get("/0615", function (req, res, next) {
  const filepath = path.join(__dirname, "letters/letter-data.json");
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.render("index", { letterData: "" });
    } else {
      try {
        data = JSON.parse(data);
        res.render("index2", { letterData: data });
      } catch (e) {
        res.render("index2", { letterData: "" });
      }
    }
  });
});

/**
 * 편지 저장
 */
router.post("/letter", function (req, res, next) {
  const senderFilepath = path.join(__dirname, "letters/sender-data.json");
  const letterFilepath = path.join(__dirname, "letters/letter-data.json");
  fs.readFile(senderFilepath, (err, senderData) => {
    if (err) {
      res.status(500).send({ message: "Internal Server Error" });
    } else {
      fs.readFile(letterFilepath, (err, letterData) => {
        if (err) {
          res.status(500).send({ message: "Internal Server Error" });
        }else{
          try {
            const { sender, content, imgIndex, to } = req.body;
            // Sender List Data
            senderData = JSON.parse(senderData);
            senderData.senderList.push({
              sender: sender,
              imgIndex: imgIndex,
            });
            senderData = JSON.stringify(senderData);

            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Seoul'
            };
            
            const now = new Date();
            let formattedDate = new Intl.DateTimeFormat('ko-KR', options).format(now);
            
            // 형식 변환을 위해 추가적인 조작 수행
            formattedDate = formattedDate
                .replace(/\s/g, '') // 모든 공백 제거
                .replace(/(\d{4})\.(\d{2})\.(\d{2})\.(오전|오후)(\d{2}):(\d{2})/, (match, year, month, day, period, hour, minute) => {
                    return `${year}.${month}.${day} ${period}${hour}:${minute}`;
                });
  
            // Letter Data
            letterData = JSON.parse(letterData);
            letterData[to].push({
              sender: sender,
              content: content,
              imgIndex: imgIndex,
              to: to,
              createAt: formattedDate,
            });
            letterData = JSON.stringify(letterData);
  
            // Save Letter Data
            fs.writeFile(letterFilepath, letterData, (err) => {
              if (err) {
                res.status(500).send({ message: "Internal Server Error" });
              } else {
                fs.writeFile(senderFilepath, senderData, (err) => {
                  if (err) {
                    res.status(500).send({ message: "Internal Server Error" });
                  } else {
                    res.send({ message: "Letter saved" });
                  }
                });
              }
            });
          } catch (e) {
            console.log(e);
            res.status(500).send({ message: "Internal Server Error" });
          }
        }
      });
    }
  });
});

/**
 * 어드민
 */
router.get("/admin/:pw", async function (req, res, next) {
  let pw = req.params.pw;
  if (pw === "rana0723") {
    try {
      var dataArr = [];
      const filepath = path.join(__dirname, "letters");
      var files = fs.readdirSync(filepath);
      for (const file of files) {
        if (file.split("-")[0] == "letter") {
          const filepath2 = path.join(filepath, file);
          var data = fs.readFileSync(filepath2);
          data = JSON.parse(data);
          dataArr.push(data);
        }
      }
      var jsonString = JSON.stringify(dataArr);
      res.render("admin", { letterData: jsonString });
    } catch (error) {
      res.render("index", { letterData: "" });
    }
  } else {
    res.render("index", { letterData: "" });
  }
});

module.exports = router;
