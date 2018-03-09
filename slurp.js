const Helpscout = require('helpscout')
const level = require('level')
const db = level('./issues')
const config = require('./config.json')
const { key, mailboxId } = config
let helpscout

// Helpscout rate limits at 2000 requests per minute for single-site desks.
const minute = 1000 * 60
const period = minute * 10
const limit = 2000
const interval = limit / period

start().catch(console.error)

async function start () {
  helpscout = new Helpscout(key, mailboxId)

  let pageNum = 0
  let maxPage = 999

  while (pageNum < maxPage) {
    console.log(`requesting page ${pageNum} of ${maxPage}`)
    const results = await getConversations(pageNum)
    const { page, pages, count, items } = results

    const conversations = await Promise.all(items.map(async (item) => {
      console.log(`requesting conversation id ${item.id}`)
      const conversation = await getConversation(item.id)
      console.log('A CONVERSATION:', item.id)
      return conversation
    }))
    console.dir(conversations)

    await db.batch(conversations.map((item) => {
      console.log('putting item with', JSON.stringify(item))
      return {
        type: 'put',
        key: item.item.id,
        value: JSON.stringify(item),
      }
    }))
    console.log('batch saved successfully.')

    maxPage = pages
    pageNum++
  }
}

async function getConversations (pageNum) {
  await pause()
  return new Promise((res, rej) => {
    helpscout.conversations.list({
      page: pageNum || 1,
    }, (err, convos) => {
      if (err) return rej(err)
      return res(convos)
    })
  })
}

async function getConversation (conversationId) {
  await pause()
  return new Promise((res, rej) => {
    helpscout.conversations.get({
      id: conversationId,
    }, (err, results) => {
      if (err) return rej(err)
      return res(results)
    })
  })
}

async function pause () {
  return new Promise((resolve) => {
    setTimeout(resolve, interval)
  })
}
