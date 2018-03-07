# Helpscout Issue Sorter

A set of scripts intended to help auto-reply intelligently to help desk requests.

Includes 3 scripts:

- slurp.js: Downloads helpscout issues into local leveldb.
- analyze.js: Trains a bayesian classifier with tagged leveldb issues.
- classifier.js: Uses the trained classifier to infer tags from given text.

## Slurp

Requires a `config.json` file with a `key` string (your HelpScout API key) and a `mailboxId` number (your HelpScout mailbox ID number).

To use: `node slurp.js`

## Analyze

Requires the slurp script has run and created an `issues` db folder in this directory, full of your project's issues.

To use: `node analyze.js`

## Classify

Requires the Analyze script to have saved its `classify.json` serialied trained bayesian classifier. Exports a function that accepts a `string` as its input, and will return the closest identified tag.

