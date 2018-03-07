const Helpscout = require('helpscout')
const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)

const mailboxId = 'f9531b211ca18150'

start().catch(console.error)

async function start () {

  const rawFile = await readFile(__dirname + '/key.txt')
  const key = rawFile.toString()

  const helpscout = new Helpscout(key, mailboxId)



}
