require('dotenv').config()

const line = require('@line/bot-sdk')
const express = require('express')
const fs = require('fs')
const axios = require("axios");

const app = express()

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
}

const client = new line.Client(config)

const PORT = process.env.PORT || 3000


let stats = {}

if (fs.existsSync('./data.json')) {
  stats = JSON.parse(fs.readFileSync('./data.json'))
}

async function saveToSheet(name, score, rank) {
  try {
    await axios.post(
      "https://script.google.com/macros/s/AKfycbxBSekPemh-aqyVo1VqB5PV-YbwPh_Qr1_3iDibpGoZnn5hoLoRW1sreh-fUCimu6_jEg/exec",
      {
        name: name,
        score: score,
        rank: rank
      }
    );

    console.log("시트 저장 성공");

  } catch (error) {
    console.log("시트 저장 실패:", error.message);
  }
}

app.post('/webhook', line.middleware(config), (req, res) => {

  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.sendStatus(200))
    .catch(err => {
      console.error(err)
      res.sendStatus(500)
    })

})


async function handleEvent(event) {


  // 그룹 입장
if (event.type === 'memberJoined') {

  return client.replyMessage(event.replyToken, [
    {
      type: 'image',
      originalContentUrl: 'https://i.pinimg.com/736x/55/e1/74/55e174c837fbfd1124486fbd45bd34e7.jpg',
      previewImageUrl: 'https://i.pinimg.com/736x/55/e1/74/55e174c837fbfd1124486fbd45bd34e7.jpg'
    },
    {
      type: 'text',
      text: `반가워요! 🎨Palette🌈에 오신 걸 환영합니다.

📌 공지 및 노트는 꼭 확인해주세요.
😊 간단한 자기소개도 부탁드립니다.

즐거운 시간 보내세요!`
    }
  ]);

}


  // 텍스트 메시지만 기록
  if (
    event.type === 'message' &&
    event.message.type === 'text'
  ) {


    const groupId =
      event.source.groupId ||
      event.source.roomId


    const userId = event.source.userId


    if (!groupId || !userId) {
      return null
    }



    // 순위 확인
    if (event.message.text === "!순위") {


      const ranking = stats[groupId] || {}


      const list = Object.values(ranking)
        .sort((a,b)=> b.count - a.count)
        .slice(0,3)



      let text = "🏆 마디수 순위\n\n"


      if(list.length === 0){

        text += "아직 기록이 없습니다."

      } else {


        const medal = ["🥇","🥈","🥉"]


        list.forEach((user,index)=>{

          text += `${medal[index]} ${user.name} - ${user.count}글자\n`

        })


      }


      return client.replyMessage(event.replyToken,{
        type:"text",
        text:text
      })

    }



    // 이름 가져오기

    let userName = "알수없음"


    try {

      const profile =
        await client.getGroupMemberProfile(groupId,userId)

      userName = profile.displayName


    } catch(e){

      console.log("프로필 가져오기 실패")

    }



    if(!stats[groupId]){
      stats[groupId]={}
    }



    if(!stats[groupId][userId]){

      stats[groupId][userId]={
        name:userName,
        count:0
      }

    }



    stats[groupId][userId].name=userName

    stats[groupId][userId].count += event.message.text.length


saveToSheet(
  userName,
  stats[groupId][userId].count,
  0
)


    fs.writeFileSync(
      './data.json',
      JSON.stringify(stats,null,2)
    )

  }


  return null

}



app.listen(PORT,()=>{

 console.log(`서버 실행 중! PORT:${PORT}`)

})