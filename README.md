# Helpscout Issue Sorter

A set of scripts intended to help auto-reply intelligently to help desk requests.

Includes 3 scripts:

- slurp.js: Downloads helpscout issues into local leveldb.
- train.js: Trains a logistic regression classifier with tagged leveldb issues.  classifier.js: Uses the trained classifier to infer tags from given text.

## Slurp

Requires a `config.json` file with a `key` string (your HelpScout API key) and a `mailboxId` number (your HelpScout mailbox ID number).

You can see the format for `config.json` as `config.json.sample`

To use: `node slurp.js`

## Train

Requires the slurp script has run and created an `issues` db folder in this directory, full of your project's issues.

To use: `node train.js`

## Classify

Requires the Train script to have saved its `classify.json` serialied trained classifier. Exports a function that accepts a `string` as its input, and will return the closest identified tag.

## Tag Frequency

Bonus script! Reports the current most popular tags. Pretty simple, could be a lot more interesting, but it's really not!

`node tag-frequency.js`

