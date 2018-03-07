const Helpscout = require('helpscout')
const level = require('level')
const db = level('./issues')
const config = require('./config.json')
const { key, mailboxId } = config

let helpscout

start().catch(console.error)

async function start () {
  helpscout = new Helpscout(key, mailboxId)

  let pageNum = 0
  let maxPage = 999

  while (pageNum < maxPage) {
    console.log(`requesting page ${pageNum} of ${maxPage}`)
    const results = await getConversations(pageNum)
    const { page, pages, count, items } = results

    await db.batch(items.map((item) => {
      return {
        type: 'put',
        key: item.id,
        value: JSON.stringify(item),
      }
    }))
    console.log('batch saved successfully.')

    maxPage = pages
    pageNum++
  }
}

async function getConversations (pageNum) {
  return new Promise((res, rej) => {
    helpscout.conversations.list({
      page: pageNum || 1,
    }, (err, convos) => {
      if (err) return rej(err)
      return res(convos)
    })
  })
}


