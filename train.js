const level = require('level')
const db = level('./issues')

const natural = require('natural')
const classifier = new natural.LogisticRegressionClassifier()

db.createReadStream()
.on('data', function (data) {

  const result = JSON.parse(data.value)
  const item = result.item
  const threads = item.threads
  const tags = item.tags || []
  if (tags.length > 0) {
    const tag = item.tags[0]
    const userText = threads.filter(item => item.type === 'customer')
    .map(thread => thread.body)
    .join(' ')
    classifier.addDocument(userText, tag)
  }
})
.on('error', function (err) {
  console.log('Oh my!', err)
})
.on('close', function () {
  console.log('stream closed')
})
.on('end', function () {
  classifier.train()
  saveClassifier()
})

function saveClassifier () {
  classifier.save('classifier.json', function (err, classifier) {
    if (err) {
      return console.log('Failed to save classifier', err)
    }
    console.log('Classifier saved as classifier.json')
  })
}

