import Ember from 'ember';

var ApplicationModalComponent = Ember.Component.extend({
    classNames: ['application-modal'],
    actions: {
        rollback_model() {
            let tab = this.trx.attemptedTabModel;
            let transition = this.trx.attemptedTransition;
            let model = this.trx.attemptedTransitionModel;
            let action = this.trx.attemptedAction;
            model.rollback();
            model.rollbackRelated();
            if(action){
                this.sendAction(action, tab);
            }else{
                transition.retry();
            }
        },
        cancel_modal() {
            this.sendAction('cancel_modal', this.trx.attemptedTabModel);
        }
    }
});

export default ApplicationModalComponent;
