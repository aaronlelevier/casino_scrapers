import Ember from 'ember';
import injectStore from 'bsrs-ember/utilities/store';

var TabSingle = Ember.Component.extend({
    store: injectStore('main'),
    actions: {
        cancel_modal() {
            Ember.$('.t-modal').modal('hide');
        },
        rollback_model() {
            this.sendAction('rollback_model');
        },
        parentAction() {
            let tab = this.get('store').find('tab', this.get('model.id'));
            this.sendAction('parentAction', tab);
        }
    }
});

export default TabSingle;
