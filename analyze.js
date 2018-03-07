const level = require('level')
const db = level('./issues')

const natural = require('natural')
const classifier = new natural.BayesClassifier()

db.createReadStream()
.on('data', function (data) {
  const item = JSON.parse(data.value)
  if (item.tags.length > 0) {
    const tag = item.tags[0]
    const { subject, preview } = item
    const text = `${subject} ${preview}`
    classifier.addDocument(text, tag)
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

