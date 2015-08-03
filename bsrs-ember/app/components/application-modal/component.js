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
            var storeType = this.trx.storeType;
            if (newModel) {
                this.get('store').remove(storeType, model.get('id'));
            }
            model.rollback();
            model.rollbackRelated();
            transition.retry();
        },
        cancel_modal() {
            this.sendAction('cancel_modal');
        }
    }
});
