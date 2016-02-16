import Ember from 'ember';

export default Ember.Object.extend({
    fullname: Ember.computed('first_name', 'last_name', function() {
        const first_name = this.get('first_name');
        const last_name = this.get('last_name');
        return first_name + ' ' + last_name;
    }),
});


