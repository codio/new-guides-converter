/*
    Guides Section Object
*/
    'use strict';

    var _ = require('lodash');
    var tools = require('../tools');

    var consts = require('../consts');
    var Action = require('./action');

    var app,$, fileWait;

    // default section
    var DEFAULT_SECTION = {
        title: 'New Section',
        'type': 'markdown'
    };

    var Section = function (data) {
        importData(this, data);
    };

    var p = Section.prototype;

    //Private functions

    function generateId() {
        return tools.GUID();
    }

    function importData(self, data) {
        data = _.defaults(data, DEFAULT_SECTION);
        self._id = (_.isUndefined(data.id)) ? generateId() : data.id;
        self._title = data.title;
        self.actions = data.files;
        self.layout = data.layout;
        self.paths = data.path;
        self._contentType = data.type;

        self.contentPath = data.contentPath;
    }

    function loadFile(file, wait) {
        wait = wait || false;
        var currentProject = app.currentProject;
        if (currentProject) {
            if (!app.currentProject.exists(file)) {
                var d = $.Deferred().resolve();
                if (wait) {
                    d = fileWait(file);
                }
                // create a file if not exists
                var parsed =  tools.path.parse(file);
                var name = parsed.name;
                var dir = parsed.dir;
                return d.then(function (isExist) {
                    if (!isExist) {
                        return currentProject.createFile(name, dir);
                    }
                }).then(function () {
                    return currentProject.file(file);
                });
            }

            return currentProject.file(file);
        }

        return $.Deferred().reject();
    }

    function escapeTitleForPath(str) {
        return tools.path.escape(str);
    }

    function getFileExtensionsByContentType(type) {
        switch (type) {
        case 'markdown':
            return 'md';
        case 'html':
            return 'html';
        default:
            return 'txt';
        }
    }

    function generateContentPath(self) {
        var fileName = escapeTitleForPath(self.title);
        var guideContentDir = consts.GUIDES_CONTENT_FOLDER;
        var extension = getFileExtensionsByContentType(self.contentType);
        var id = self.id.slice(0, 4);
        return [guideContentDir, '/', fileName, '-', id, '.', extension].join('');
    }

    function updateFileName(self) {
        var newFileName = generateContentPath(self);
        self._contentPromise = undefined;
        self._fileMovePromise = onFileMove(self, newFileName).then(function () {
            self._fileMovePromise = undefined;
            self._contentPath = newFileName;
        });
        return self._fileMovePromise;
    }

    function onFileMove(self, newPath) {
        var currentProject = app.currentProject;
        if (currentProject) {
            return currentProject.renameItem(self.contentPath, newPath);
        }
        return $.Deferred.reject();
    }


    // Validators
    function validateActions(actions) {
        actions = _.isArray(actions) ? actions : [];
        // TODO add actions format and props validation
        _.forEach(actions, function (action, pos) {
            if (! (action instanceof Action)) {
                actions[pos] = new Action(action);
            }
        });
        return actions;
    }

    function validateLayout(layout) {
        // TODO: add validate layout
        return layout;
    }

    function serializeActions(actions) {
        return _.map(actions, 'json');
    }

    function getContentPromise(self) {
        if (_.isUndefined(self._contentPromise)) {
            var d = $.Deferred().resolve();
            if (self._fileMovePromise) {
                d = self._fileMovePromise;
            }
            self._contentPromise = d.then(function () {
                return loadFile(self.contentPath, self._afterMajorUpdate);
            }).then(function (file) {
                self._afterMajorUpdate = undefined;
                return file.doc;
            });
        }

        return self._contentPromise;
    }

    function triggerSectionUpdate(self) {
    }

    // Properties
    Object.defineProperty(p, 'id', {
        get: function () {
            return this._id;
        }
    });

    Object.defineProperty(p, 'title', {
        get: function () {
            return this._title;
        },
        set: function (title) {
            this._title = title;
            updateFileName(this);
            triggerSectionUpdate(this);
        }
    });

    Object.defineProperty(p, 'actions', {
        get: function () {
            return this._actions;
        },
        set: function (actions) {
            actions = validateActions(actions);
            this._actions = actions;
        }
    });

    Object.defineProperty(p, 'contentType', {
        get: function () {
            return this._contentType;
        },
        set: function (type) {
            this._contentType = type;
            updateFileName(this);
        }
    });

    Object.defineProperty(p, 'contentPath', {
        get: function () {
            return this._contentPath;
        },
        set: function (value) {
            if (!_.isString(value)) {
                this._contentPath = generateContentPath(this);
            }
            else {
                this._contentPath = value;
            }
        }
    });

    Object.defineProperty(p, 'contentDoc', {
        get: function () {
            return getContentPromise(this);
        }
    });

    Object.defineProperty(p, 'layout', {
        get: function () {
            return this._layout;
        },
        set: function (layout) {
            layout = validateLayout(layout);
            this._layout = layout;
        }
    });

    Object.defineProperty(p, 'paths', {
        get: function () {
            return this._paths;
        },
        set: function (paths) {
            var pathsArray = [];
            if (_.isString(paths)) {
                _.map(paths.split(';'), function (path) {
                    path = _.trim(path);
                    if (path.length > 0) {
                        pathsArray.push(path);
                    }
                });
            } else if (_.isArray(paths)) {
                pathsArray = paths;
            }
            this._paths = pathsArray;
        }
    });

    Object.defineProperty(p, 'json', {
        get: function () {
            var res = {
                'id': this.id,
                'title': this.title,
                'files': serializeActions(this.actions),
                'layout': this.layout,
                'path': this.paths,
                'type': this.contentType,
                'content-file': this.contentPath
            };

            return res;
        }
    });

    Object.defineProperty(p, 'isCloseAll', {
        get: function () {
            var res = false;
            var actions = this.actions;
            _.forEach(actions, function (action) {
                if (action.isCloseAll) {
                    res = true;
                    return false;
                }
            });
            return res;
        }
    });

    p.setValue = function (value) {
        this.contentDoc.done(function (doc) {
            doc.setValue(value);
        });
    };

    p.update = function (json) {
        // TODO detect a file move by someone else
        var major = false;
        if (json.title !== this.title) {
            // a filename update
            major = true;
            this._afterMajorUpdate = true;
            this._contentPromise = undefined;
        }
        importData(this, json);
        return major;
    };

    p.remove = function () {
        // TODO section remove event
        this._contentPromise = undefined;
        var currentProject = app.currentProject;
        var contentPath = this.contentPath;
        if (currentProject) {
            currentProject.deleteItems([contentPath])
                .fail(function (err) {
                    console.err('Fail to remove guide content ' + contentPath + ': ' + err);
                });
        }
    };

    module.exports = Section;
