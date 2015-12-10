import Ember from 'ember';

Ember.Test.registerHelper('substring_up_to_num', function(window, str) {
    return str.substring(0, str.search(/\d/));
});

export default function noop() {}
