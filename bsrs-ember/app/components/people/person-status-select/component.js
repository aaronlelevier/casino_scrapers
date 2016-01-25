import Ember from 'ember';

var PersonStatus = Ember.Component.extend({
    actions: {
        selected(status) {
            this.get('person').change_status(status.get('id'));
        }
    }
});

export default PersonStatus;
