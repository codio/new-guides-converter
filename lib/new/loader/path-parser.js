// Module for file open/close string parsing
    'use strict';

    var _ = require('lodash');

    // Removes unneeded ./ or / from the beginning
    function processPath(path) {
        if (path[0] === '.' && path[1] === '/') {
            path = path.substr(2);
        } else if (path[0] === '/') {
            path = path.substr(1);
        }
        return path;
    }

    // Process a segment to extract plugin and parameters.
    //
    // segment -a String. ex #preview, #ssh: ls -al, idndex.html.
    //
    // Returns an object command property contains plugin to open,
    // content parameters to the plugin (file to open or command to execute).
    function parsePathSegment(segment) {
        segment = _.trim(segment);
        if (segment.length === 0) {
            return false;
        }
        var command, content;
        if (segment[0] === '#') {
            // commands
            command = _.trim(segment.split(':', 1)[0].substr(1));
            content = _.trim(segment.substr(command.length + 2));
        }
        else {
            //file
            command = 'file';
            content = segment;
        }

        if (command === 'file') {
            content = processPath(content);
        }

        return {
            type: command,
            content: content
        };
    }

    // Parses path string, and extracts segments.
    //
    // path - a string. user entered string,  "," used as a delimiter for segments.
    //
    // Returns an array of parsed items.
    function parsePath(path) {
        var items = path.split(',');
        var res = [];
        _.each(items, function (item) {
            item = _.trim(item);
            var parsedSegment = parsePathSegment(item);
            if (parsedSegment !== false) {
                res.push(parsedSegment);
            }
        });

        return res;
    }

    // parses input file object and return an array of sections.
    //
    // path - a string to parse.
    //
    // Returns array of parsed elements in the file item.
    module.exports = function (path) {
        return parsePath(path);
    };
