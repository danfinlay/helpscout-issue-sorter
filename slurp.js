const Helpscout = require('helpscout')
const level = require('level')
const db = level('./issues')
const config = require('./config.json')
const { key, mailboxId } = config
let helpscout

// Helpscout rate limits at 2000 requests per minute for single-site desks.
// Requesting "safely" below that limit (I keep getting rate limited!!!)
const minute = 1000 * 60
const period = minute * 10
const limit = 1500
const interval = Math.ceil(period / limit)

start().catch(console.error)

async function start () {
  helpscout = new Helpscout(key, mailboxId)

  let pageNum = 1
  let maxPage = 999

  while (pageNum <= maxPage) {
    console.log(`requesting page ${pageNum} of ${maxPage}`)

    try {
      const results = await getConversations(pageNum)

      const { page, pages, count, items } = results

      await pause(items.length * interval)
      const conversations = await Promise.all(items.map(async (item) => {
        try {
          const conversation = await getConversation(item.id)
          return conversation
        } catch (e) { return null }
      }))

      await db.batch(conversations.map((item) => {
        if (!item) return null

        return {
          type: 'put',
          key: item.item.id,
          value: JSON.stringify(item),
        }
      }))

      maxPage = pages
      pageNum++
      await pause(interval)

    } catch (e) {
      console.log('skipping that page because', e)
      pageNum++
    }
  }
}

async function getConversations (pageNum) {
  await pause(interval)
  console.log('getting those convos')
  return new Promise((res, rej) => {
    helpscout.conversations.list({
      page: pageNum || 1,
      // only get tagged conversations
      // undocumented hack!!!
      'query': '-tags:1',
    }, (err, convos) => {
      console.log('convos returned with', err, convos)
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

