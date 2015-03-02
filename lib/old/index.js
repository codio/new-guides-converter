'use strict';
var promise = require('bluebird');
var nodeFs = require('fs');
var fs = promise.promisifyAll(nodeFs);
var parser = require('./parser');


exports.load = function(file) {
    return fs.readFileAsync(file).then(function (content) {
        parser.setRawData(content);
        return parser.getParsedData();
    });
};

exports.cleanup = function(file) {
    return fs.unlinkAsync(file);
};