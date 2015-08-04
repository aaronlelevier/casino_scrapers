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
            model.rollback();
            model.rollbackRelated();
            if (newModel) {
                model.removeRecord(model.get('id'));
            }
            transition.retry();
        },
        cancel_modal() {
            this.sendAction('cancel_modal');
        }
    }
});
