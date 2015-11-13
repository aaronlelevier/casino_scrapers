import Ember from 'ember';
const { Route, inject } = Ember;

export default Ember.Component.extend({
    i18n: inject.service(),
});
