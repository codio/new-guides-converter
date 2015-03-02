'use strict';

var metadata = require('./loader/metadata');
var save = require('./save');
var Section = require('./loader/section');

exports.getMetadata = function () {
    return metadata;
};

exports.save = save;
exports.Section = Section;