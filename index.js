require('dotenv').config()
const line = require('@line/bot-sdk')
const express = require('express')
const fs = require('fs')

const app = express()

const config = {
  channelAccessToken:e5tlQ0Acq5+d9hWAEUWEwv3LESS0xNrOMR1eToZbACjR4upxGDRBFRJLBzEq5yAdCGoxxUYrFhyTmvh87H1/HIbaq76mKgdWohsurcnOJxIH1UcUztXW7Ml7AZI81g+OQBtt+LJ4Mpk22qhO78f2KQdB04t89/1O/w1cDnyilFU=,
  channelSecret:1ee15d5f27c55a9f296415c9632a0f28,
}

const client = new line.Client(config)

let stats = {}

if (fs.existsSync('./data.json')) {
  stats = JSON.parse(fs.readFileSync('./data.json'))
} else {
  stats = {}
}

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.sendStatus(200))
    .catch(err => {
      console.error('에러:', err)
      res.sendStatus(500)
    })
})

async function handleEvent(event) {
  try {

    const groupId = event.source.groupId || event.source.roomId
    const userId = event.source.userId

    if (
      groupId &&
      event.type === 'message' &&
      event.message.type === 'text'
    ) {

      if (event.message.text === "!순위") {

        const ranking = stats[groupId] || {}

        const list = Object.values(ranking)
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)

        let text = "🏆 마디수 순위\n\n"

        if (list.length === 0) {
          text += "아직 기록이 없습니다."
        } else {
          const medals = ["🥇", "🥈", "🥉"]

          list.forEach((user, index) => {
            text += `${medals[index]} ${user.name} - ${user.count}글자\n`
          })
        }

        return client.replyMessage(event.replyToken, {
          type: "text",
          text: text
        })
      }

      let userName = "알수없음"

      try {
        const profile = await client.getGroupMemberProfile(groupId, userId)
        userName = profile.displayName
      } catch (e) {
        console.log("프로필 에러:", e.message)
      }

      if (!stats[groupId]) stats[groupId] = {}

      if (!stats[groupId][userId]) {
        stats[groupId][userId] = {
          name: userName,
          count: 0
        }
      }

      stats[groupId][userId].name = userName
      stats[groupId][userId].count += event.message.text.length

      fs.writeFileSync('./data.json', JSON.stringify(stats, null, 2))
    }

    return Promise.resolve(null)

  } catch (err) {
    console.error("🔥 handleEvent 에러:", err)
    return Promise.resolve(null)
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('서버 실행 중!');
});