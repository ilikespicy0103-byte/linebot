const fs = require("fs")

let stats = {}

if (fs.existsSync("./data.json")) {
  stats = JSON.parse(fs.readFileSync("./data.json"))
} else {
  stats = {}
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

  let groupId = event.source.groupId || event.source.roomId
  let userId = event.source.userId

  if (
    groupId &&
    event.type === 'message' &&
    event.message.type === 'text'
  ) {

    // 👉 닉네임 가져오기
let profile = await client.getGroupMemberProfile(groupId, userId)
let userName = profile.displayName

    // 👉 순위 출력
    if (event.message.text === "!순위") {

      let ranking = stats[groupId] || {}

      let list = Object.values(ranking)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3) // ✅ TOP 3만

      let text = "🏆 마디수 순위\n\n"

      if (list.length === 0) {
        text += "아직 기록이 없습니다."
      } else {

        const medals = ["🥇", "🥈", "🥉"]

        list.forEach((user, index) => {
          text += `${medals[index]} ${user.name} - ${user.count}글자\n`
        })
      }

      return client.replyMessage(event.replyToken, [
        { type: "text", text: text }
      ])
    }

    // 👉 데이터 구조 만들기
    if (!stats[groupId]) {
      stats[groupId] = {}
    }

    if (!stats[groupId][userId]) {
      stats[groupId][userId] = {
        name: userName,
        count: 0
      }
    }

    // 👉 이름 업데이트 + 글자수 증가
    stats[groupId][userId].name = userName
    stats[groupId][userId].count += event.message.text.length

    // 👉 저장
    fs.writeFileSync("./data.json", JSON.stringify(stats, null, 2))

    console.log("저장됨:", stats)
  }

  return Promise.resolve(null)
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