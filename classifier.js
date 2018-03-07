const natural = require('natural')
let classifier

natural.BayesClassifier.load('classifier.json', null, function(err, _classifier) {
  classifier = _classifier
});

module.exports = function classify (string) {
  if (!classifier) {
    return null
  }
  return classifier.classify(string)
}
