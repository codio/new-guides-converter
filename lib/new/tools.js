'use strict';

exports.GUID = function (length) {
    function fourChars() {
        return Math.floor(
            Math.random() * 0x10000 /* 65536 */
        ).toString(16);
    }

    if (length) {
        var ret = fourChars();
        for (var i = 0; i < (length); i++) {
            ret += '-' + fourChars();
        }
        return (ret + '');
    } else {
        return (
            fourChars() + fourChars() + '-' +
            fourChars() + '-' +
            fourChars() + '-' +
            fourChars() + '-' +
            fourChars() + fourChars() + fourChars()
        );
    }
};

exports.path = {
    escape: function (name) {
        return (name || '').replace(/[^a-z0-9]/gi, '-');
    }
};

