import Ember from 'ember';

export default Ember.Object.extend({
    name: Ember.computed('fullname', function() {
        return this.get('fullname');
    })
});
