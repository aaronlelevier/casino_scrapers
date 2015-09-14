import Ember from 'ember';

var ApplicationModalComponent = Ember.Component.extend({
    classNames: ['application-modal'],
    actions: {
        rollback_model() {
            let transition = this.trx.attemptedTransition;
            let model = this.trx.attemptedTransitionModel;
            model.rollback();
            model.rollbackRelated();
            transition.retry();
        },
        cancel_modal() {
            this.sendAction('cancel_modal');
        }
    }
});

export default ApplicationModalComponent;
