const level = require('level')
const db = level('./issues')

const tagFrequency = {}

db.createReadStream()
.on('data', function (data) {

  const result = JSON.parse(data.value)
  const item = result.item
  const threads = item.threads
  const tags = item.tags || []

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
  const tagObjs = Object.keys(tagFrequency).map((tag) => {
    return {
      tag: tag,
      count: tagFrequency[tag],
    }
  })
  .sort((a, b) => {
    return a.count < b.count
  })
  .map((tagObj) => {
    return `${tagObj.tag}: ${tagObj.count}`
  })
  .join('\n')

  console.log(tagObjs)
}

