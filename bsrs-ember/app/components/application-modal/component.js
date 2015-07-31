import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Component.extend({
    classNames: ['application-modal'],
    store: inject('main'),
    actions: {
        rollback_model() {
            var transition = this.trx.attemptedTransition;
            var model = this.trx.attemptedTransitionModel;
            var newModel = this.trx.newModel;
            if (newModel) {
                model.rollback();
                this.get('store').remove('person', model.get('id'));
            } else {
                model.rollback();
                model.rollbackPhoneNumbers();
            }
            transition.retry();
        },
        cancel_modal() {
            this.sendAction('cancel_modal');
        }
    }
});
