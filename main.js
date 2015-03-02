'use strict';

var DEFAULT_PATH = '/home/codio/workspace';
var GUIDES_PATH = '/.guides/';
var oldGuides = require('./lib/old');
var newGuides = require('./lib/new');
var converter = require('./lib/converter');

console.log('Start');
var path = process.env.CODIO_PROJECT_PATH || DEFAULT_PATH;
oldGuides.load(path + GUIDES_PATH + 'sections.md').then(function (jsonStructure) {
    console.log('Coverting...');
    var metadata = converter(jsonStructure, newGuides);
    return metadata;
}).then(function (metadata) {
    console.log('Saving...');
    return newGuides.save(metadata, path);
}).then(function () {
    oldGuides.cleanup(path + GUIDES_PATH + 'sections.md');
}).then(function () {
    console.error('Guides were converted. Please start editor again');
}).catch(function() {
    console.error('The convention failed. Please contact with codio support team.');
});