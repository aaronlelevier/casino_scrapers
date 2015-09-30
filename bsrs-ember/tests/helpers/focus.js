import Ember from 'ember';
import QUnit from 'qunit';

var isNotFocused = function(selector) {
    var focused = Ember.$(document.activeElement);
    var expected = Ember.$(selector);

    if (expected.length > 1) {
        Ember.assert('Too many elements for selector ' + selector + ' found that were expected to have focus (' +
            expected.length + '); use a more specific selector');
        return;
    }

    if (focused.length === 0) {
        Ember.assert('Expected ' + selector + ' to not have focus, but no element was found in the dom');
    } else {
        if (focused.is(expected)) {
            QUnit.assert.ok(false);
        } else {
            var tagName = focused.prop('tagName').toLowerCase();
            var classes = focused.attr('class');

            if (classes) {
                tagName = tagName + '.' + classes.replace(/\s+/g, '.');
            }

            QUnit.assert.equal(focused.filter(selector).length, 0, 'Expected ' + selector + ' to not have focus, but ' + tagName + ' has focus');
        }
    }
};

export {isNotFocused};
