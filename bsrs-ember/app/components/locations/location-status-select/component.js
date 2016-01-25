import Ember from 'ember';

var LocationStatus = Ember.Component.extend({
    actions: {
        selected(status) {
            this.get('location').change_status(status.get('id'));
        },
    }
});

export default LocationStatus;
