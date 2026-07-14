const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: 'U5n0xLpYbRjdTvNTM15jLNQf/F2pKdRZM5vcIPgZ+JsIexF9naSdiGcbBSOHEg07CGoxxUYrFhyTmvh87H1/HIbaq76mKgdWohsurcnOJxLkOGipPzvN8Rg6P3DIwc1+EFcgbEWdoUlE9KAnFioSqgdB04t89/1O/w1cDnyilFU=',
  channelSecret: '3262de778bfcdd4a49e925a2b2d3533c'
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

  console.log(event);
  
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

app.listen(3000, () => {
  console.log('서버 실행 중!');
});