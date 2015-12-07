import Ember from 'ember';
const { Route, inject } = Ember;

export default Ember.Component.extend({
    i18n: inject.service(),
    classNames: ['activity-list', 'row'],
    sortedModels: Ember.computed.sort('model', function(a,b) {
        if (a.get('created') > b.get('created')) {
            return -1;
        }else if (a.get('created') < b.get('created')) {
            return 1;
        }
        return 0;
    })
});
