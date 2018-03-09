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
const interval = period / limit

start().catch(console.error)

async function start () {
  helpscout = new Helpscout(key, mailboxId)

  let pageNum = 0
  let maxPage = 999

  while (pageNum < maxPage) {
    console.log(`requesting page ${pageNum} of ${maxPage}`)

    const results = await getConversations(pageNum)
    const { page, pages, count, items } = results

    await pause(items.length * interval)
    const conversations = await Promise.all(items.map(async (item) => {
      const conversation = await getConversation(item.id)
      return conversation
    }))

    await db.batch(conversations.map((item) => {
      return {
        type: 'put',
        key: item.item.id,
        value: JSON.stringify(item),
      }
    }))

    maxPage = pages
    pageNum++
    await pause(interval)
  }
}

async function getConversations (pageNum) {
  await pause(interval)
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
  await pause(interval)
  return new Promise((res, rej) => {
    helpscout.conversations.get({
      id: conversationId,
    }, (err, results) => {
      if (err) return rej(err)
      return res(results)
    })
  })
}

async function pause (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
