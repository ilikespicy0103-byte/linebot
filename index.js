const fs = require("fs");

let stats = {};

if (fs.existsSync("./data.json")) {
  stats = JSON.parse(fs.readFileSync("./data.json"));
  console.log("기존 데이터 불러옴:", stats);
} else {
  console.log("저장된 데이터 없음, 새로 시작");
}

const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: 'ahcygSA1tL7NjahzndzKYBK/IX5Kf5VfEVhDxrF+fUnfVKuWA5xVXS0GFWNtjCLvCGoxxUYrFhyTmvh87H1/HIbaq76mKgdWohsurcnOJxLvPX1I057obAqeAKfjiCrFk6QYRmtNxxOTzItfmlH6CAdB04t89/1O/w1cDnyilFU=',
  channelSecret: '218c9df27405cd1b7ada5fa3c46f5409'
}

const app = express();
const client = new line.Client(config);

app.get('/webhook', (req, res) => {
  res.send('OK');
});

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.status(200).end())
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {

  let groupId = event.source.groupId || event.source.roomId;
  let userId = event.source.userId;


  if(
    groupId &&
    event.type === 'message' &&
    event.message.type === 'text'
  ){

   console.log("입력 내용:", event.message.text);
if(event.message.text === "!순위"){

  let ranking = stats[groupId] || {};

  let list = Object.entries(ranking)
    .sort((a,b)=> b[1] - a[1])
    .slice(0,10);

  let text = "🏆 마디수 순위\n\n";

  if(list.length === 0){
    text += "아직 기록이 없습니다.";
  } else {
    list.forEach((user,index)=>{
      text += `${index+1}위 : ${user[1]}마디\n`;
    });
  }

  return client.replyMessage(event.replyToken, [
    { type:"text", text:text }
  ]);
}

if(!stats[groupId]){
  stats[groupId] = {};
}

if(!stats[groupId][userId]){
  stats[groupId][userId] = 0;
}

stats[groupId][userId]++;

fs.writeFileSync(
      "./data.json",
      JSON.stringify(stats, null, 2)
    );

console.log("저장됨:", stats);
  }
}
  
  if (event.type === 'memberJoined') {
    return client.replyMessage(event.replyToken, [
      {
        type: 'image',
        originalContentUrl: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDEwMTJfMTAw%2FMDAxNzI4NzAzMTA1MzM3.w1AKvOE3h-ExIBoEjKPR7UZzOtlzPOrFigCy0-ZANYQg.ziLQm0pKXyawqRN8O1zhvCY0JPGiBLHStX9Agu2rV7Eg.JPEG%2F%25B4%25D9%25BF%25B4%25BF%25A8.jpeg&type=sc960_832',
        previewImageUrl: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDEwMTJfMTAw%2FMDAxNzI4NzAzMTA1MzM3.w1AKvOE3h-ExIBoEjKPR7UZzOtlzPOrFigCy0-ZANYQg.ziLQm0pKXyawqRN8O1zhvCY0JPGiBLHStX9Agu2rV7Eg.JPEG%2F%25B4%25D9%25BF%25B4%25BF%25A8.jpeg&type=sc960_832'
      },
      {
        type: 'text',
        text: `반가워요! 🎨Palette🌈에 오신 걸 환영합니다. ✨
공지 및 노트는 꼭 확인해주시고, 간단한 자기소개 부탁드립니다! (ღ’ᴗ‘ღ)`
      }
    ]);
  }
  return Promise.resolve(null);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('서버 실행 중!');
});