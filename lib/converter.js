'use strict';

var _ = require('lodash');
var newGuides =  require('./new');

function convertSection(oldSection) {
    var sectionJson = {
        title: oldSection.header.title,
        files: oldSection.header.files,
        layout: oldSection.header.layout,
        paths: oldSection.header.path,
        contentType: 'markdown'
    };

    var section = new newGuides.Section(sectionJson);
    section.codio_value = oldSection.body;
    return section;
}

module.exports = function (oldJson) {
    var metadata = newGuides.getMetadata();
    _.each(oldJson, function (oldSection) {
        var newSection = convertSection(oldSection);
        metadata.addSection(newSection);
    });
    return metadata;
};