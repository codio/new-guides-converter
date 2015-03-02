'use strict';

var promise = require('bluebird');
var fs = promise.promisifyAll(require('fs'));
var _ = require('lodash');

function write(file, data) {
    console.log('Writing ' + file + '...');
    //console.log('Content: ' + data + '...');
    return fs.writeFileAsync(file, data);
}

function createFolder(path) {
    var contentFolder = path + '/content';
    return fs.statAsync(contentFolder).then(function(stat) {

    }).catch(function (stat) {
        console.log('Creating content Folder...');
        return fs.mkdirAsync(contentFolder);
    });
}

module.exports = function (metadata, path) {
    var sections = metadata.getSections();
    return createFolder(path + '/.guides').then(function () {
        var sectionPromises = _.map(sections, function (section) {
            return write(path + '/' + section.contentPath, section.codio_value);
        });
        return promise.all(sectionPromises);
    }).then(function () {
        return write(path + '/.guides/metadata.json', metadata.jsonString());
    });
};