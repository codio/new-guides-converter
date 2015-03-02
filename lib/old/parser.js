'use strict';
var _ = require('lodash');
var guideItemParser = require('./guides-parser');

var DECILETER = '---';

var parsedData = [];
var brokenItems = [];

function parse(data) {
    data = '\n' + data; // adding this to make split work from first symbol;
    var items = data.split(new RegExp('\n' + DECILETER + '\n'));
    items.shift(); // remember we added shit 2 lines above, lets remove it
    parsedData = [];
    brokenItems = [];
    var itemParsed = null;
    for (var i = 0; i < items.length; i = i + 2) {
        try {
            itemParsed = guideItemParser.parse(
                DECILETER + '\n' +
                items[i] + '\n' +
                DECILETER +
                items[i + 1]
            );
        } catch (e) {
            console.error(e);
            itemParsed = null;
        }
        if (itemParsed === null) {
            continue;
        }
        if (_.isArray(itemParsed.errors) && itemParsed.errors.length > 0) {
            brokenItems.push(itemParsed);
        } else {
            parsedData.push(itemParsed);
        }
    }
}

function getYaml(headers) {
    return guideItemParser.serialize(headers);
}

function serialize(data) {
    var res = [];
    _.each(data, function (value, i) {
        res.push(DECILETER);
        res.push(getYaml(value.header));
        res.push(DECILETER);
        res.push(value.body);
    });
    return res.join('\n');
}

exports.getParsedData = function () {
    return parsedData;
};

exports.setRawData = function (data) {
    parse(data);
};

exports.getRaw = function () {
    return serialize(parsedData);
};