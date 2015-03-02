/*
    Guides metadata object
*/
    'use strict';

    var _ = require('lodash');

    var Section = require('./section');


    var Metadata = function () {
        this._sections = [];
        this._isClosed = true;
    };

    var p = Metadata.prototype;

    function save(self) {
        self.save();
    }

    function processSections(self, sections) {
        var newSections = [];
        var updated = [];
        var removed = [];
        _.each(sections, function (section) {
            var oldSection = self.getSectionById(section.id);
            if (_.isUndefined(oldSection)) {
                // new section was added;
                oldSection = new Section(section);
            } else {
                // section update, remove from section.
                self._sections = _.without(self._sections, oldSection);
                var majorUpdate = oldSection.update(section);
                updated.push({
                    id: oldSection.id,
                    major: majorUpdate
                });
            }
            newSections.push(oldSection);
        });
        _.each(self._sections, function (section) {
            removed.push(section.id);
            // cleanup removed sections
            section.remove();
        });

        self._sections = newSections;
        return {
            updated: updated,
            removed: removed
        };
    }

    p.set = function (fileHandler) {
        this.metadataFileHandler = fileHandler;
        this.update();
    };

    p.update = function () {
        if (this.metadataFileHandler !== null) {

            try {
                var json = this.metadataFileHandler.doc.getValue();
                if (json === this.jsonString()) {
                    // nothing changed, same cache as we have
                    return;
                }
                var data = JSON.parse(json);
                processSections(this, data.sections);
                this._isClosed = false;
                return;
            } catch (e) {
                console.log('Guides: fails to read metadata, use empty set');
            }

        }

        this._sections = [];
    };

    p.jsonString = function () {
        return JSON.stringify(this.json(), undefined, ' ');
    };

    p.save = function () {
        if (this.metadataFileHandler && this.metadataFileHandler.doc) {
            this.metadataFileHandler.doc.setValue(this.jsonString());
        }
    };

    p.getSection = function (sectionNumber) {
        return this._sections[sectionNumber];
    };

    p.getSectionById = function (id) {
        return _.find(this._sections, function (item) {
            return item.id === id;
        });
    };

    p.sectionsCount = function () {
        return this._sections.length;
    };

    p.getSections = function () {
        return _.clone(this._sections);
    };

    p.getSectionByFileName = function (fileName) {
        _.find(this._sections, {
            contentPath: fileName
        });
    };

    p.addSection = function (section, pos) {
        pos = !_.isUndefined(pos) ? pos : this.sectionsCount();
        if (!(section instanceof Section)) {
            section = new Section(section);
        }
        this._sections.splice(pos, 0, section);
        save(this);
    };

    p.moveSection = function (from, to) {
        var section = this._sections[from];
        this._sections.splice(from, 1);
        this._sections.splice(to, 0, section);
        save(this);
    };

    p.setOrder = function (order) {
        var originalData = this._sections;
        var _sections = this._sections = [];
        _.each(order, function (item, pos) {
            var oldPos = item.pos;
            _sections[pos] = originalData[oldPos];
        });
        this.save();
    };

    p.removeSection = function (idOrPosition) {
        var position = idOrPosition;
        if (!_.isNumber(idOrPosition)) {
            position = this.getSectionPosition(idOrPosition);
        }

        if (position > -1 && position < this.sectionsCount()) {
            var section = this._sections[position];
            this._sections.splice(position, 1);
            section.remove();
        }
        save(this);
    };

    p.close = function () {
        if (this.metadataFileHandler) {
            this.metadataFileHandler.close();
        }
        this.set(null);
        this._isClosed = true;
    };

    p.json = function () {
        var json = {};
        var sections = json.sections = [];
        _.forEach(this._sections, function (section) {
            sections.push(section.json);
        });
        return json;
    };

    var metadata = new Metadata();

    module.exports = metadata;
