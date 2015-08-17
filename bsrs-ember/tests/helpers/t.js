import Ember from 'ember';

Ember.Test.registerHelper('t', function(window, key, context) {
    return window.__container__.lookup('service:i18n').t(key, context);
});

export default function noop() {}
