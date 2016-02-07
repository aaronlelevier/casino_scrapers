import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
    store: inject('main'),
    removeRecord() {
        Ember.run(() => {
            this.get('store').remove('ticket-person', this.get('id'));
        });
    },
});

