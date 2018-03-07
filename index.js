const Helpscout = require('helpscout')
const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const level = require('level')
const db = level('./issues')

let helpscout

const mailboxId = '133541'

start().catch(console.error)

async function start () {
  const rawFile = await readFile(__dirname + '/key.txt')
  const key = rawFile.toString()

  helpscout = new Helpscout(key, mailboxId)

  let pageNum = 0
  let maxPage = 999

  while (pageNum < maxPage) {
    console.log(`requesting page ${pageNum} of ${maxPage}`)
    const results = await getConversations(pageNum)
    const { page, pages, count, items } = results

    await dbBatch(items.map((item) => {
      return {
        type: 'put',
        key: item.id,
        value: item,
      }
    }))
    console.log('batch saved successfully.')

    maxPage = pages
    pageNum++
  }

}

async function dbBatch (opts) {
  return new Promise((res, rej) => {
    db.batch(opts, (err) => {
      if (err) return rej(err)
      res()
    })
  })
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


