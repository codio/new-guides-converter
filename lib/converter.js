'use strict';

var _ = require('lodash');
var newGuides =  require('./new');

function convertSection(oldSection) {
    var sectionJson = {
        title: oldSection.header.title,
        files: oldSection.header.files,
        layout: oldSection.header.layout,
        path: oldSection.header.step,
        contentType: 'markdown'
    };

    var section = new newGuides.Section(sectionJson);
    var body = oldSection.body;
    body = body.replace(/(#+)([^\s#])/g, '$1 $2');
    section.codio_value = body;
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