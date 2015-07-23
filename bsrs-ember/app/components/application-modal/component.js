import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['application-modal'],
    actions: {
        rollback_model() {
            var transition = this.trx.attemptedTransition;
            var model = this.trx.attemptedTransitionModel;
            model.rollback();
            model.rollbackPhoneNumbers();
            transition.retry();
        },
        cancel_modal() {
            this.sendAction('cancel_modal');
        }
    }
});
