    'use strict';

    var _ = require('lodash');

    var pathParser = require('./path-parser');

    var Action = function(data) {
        if (!_.isUndefined(data)) {
            this.json = data;
        }
    };

    var p = Action.prototype;


    function validate(json) {
        json.action = json.action === 'close' ? 'close' : 'open';
        return json;
    }

    function recognizeCommands(self, path) {
        var commands = path;
        if (_.isString(path)) {
            commands = pathParser(path);
        }
        self.commands = commands;
    }

    function defineProperty(prototype, propName, setCallback) {
        var internalProp = '_' + propName;
        Object.defineProperty(prototype, propName, {
            get: function () {
                return this[internalProp];
            },
            set: function (value) {
                this[internalProp] = value;
                if (_.isFunction(setCallback)) {
                    setCallback(this, value);
                }
            }
        });
    }

    Object.defineProperty(p, 'json', {
        get: function() {
            return {
                path: this.path,
                panel: this.panel,
                ref: this.ref,
                lineCount: this.lineCount,
                action: this.action
            };
        },

        set: function(json) {
            json = validate(json);
            this.path = json.path;
            this.ref = json.ref;
            this.panel = json.panel;
            this.lineCount = json.lineCount;
            this.action = json.action;
        }
    });

    Object.defineProperty(p, 'isCloseAll', {
        get: function () {
            if (this.action === 'close') {
                var closeAllCommand = _.find(this.commands, {
                    content: '#tabs'
                });
                if (!_.isUndefined(closeAllCommand)) {
                    return true;
                }
            }
            return false;
        }
    });

    defineProperty(p, 'path', recognizeCommands);
    defineProperty(p, 'ref');
    defineProperty(p, 'panel');
    defineProperty(p, 'lineCount');
    defineProperty(p, 'action');
    defineProperty(p, 'commands');

    module.exports = Action;