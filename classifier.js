const natural = require('natural')
let classifier

natural.LogisticRegressionClassifier.load('classifier.json', null, function(err, _classifier) {
  classifier = _classifier
});

function classify (string) {
  if (!classifier) {
    return null
  }
  return classifier.classify(string)
}

function getClassifications (string) {
  if (!classifier) {
    return null
  }
  return classifier.getClassifications(string)
}

module.exports = {
  classify,
  getClassifications,
}

