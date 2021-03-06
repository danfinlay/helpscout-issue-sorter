const level = require('level')
const db = level('./issues')

const aDay = 24 * 60 * 60 * 1000
const aWeek = 7 * 24 * 60 * 60 * 1000
const aMonth = 30 * 24 * 60 * 60 * 1000
const allTime = Number.MAX_VALUE
const permittedAge = aMonth

const tagFrequency = {}

db.createReadStream()
.on('data', function (data) {

  const result = JSON.parse(data.value)
  const item = result.item
  const threads = item.threads
  const tags = item.tags || []

  const when = new Date(item.createdAt)
  const publishedTime = when.getTime()
  const now = Date.now()

  if (publishedTime + permittedAge < now) return

  tags.forEach((tag) => {
    if (!(tag in tagFrequency)) {
      tagFrequency[tag] = 0
    }
    tagFrequency[tag]++
  })
})
.on('error', function (err) {
  console.log('Oh my!', err)
})
.on('close', function () {
  console.log('stream closed')
})
.on('end', function () {
  announceResults()
})

function announceResults() {
  let tagObjs = Object.keys(tagFrequency).map((tag) => {
    return {
      tag,
      count: tagFrequency[tag],
    }
  })
  .sort((a, b) => {
    return b.count - a.count
  })

  tagObjs = tagObjs
  .map((tagObj) => {
    return `${tagObj.tag}: ${tagObj.count}`
  })
  .join('\n')

  console.log(tagObjs)
}

