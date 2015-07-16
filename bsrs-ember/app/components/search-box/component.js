import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['search-box'],
    actions: {
        rollback_model() {
            var transition = this.trx.attemptedTransition;
            var model = this.trx.attemptedTransitionModel;
            model.rollback();
            transition.retry();
            //rollback the model ... how?
            //this.sendAction('rollback_model');
        },
        cancel_modal() {
            this.sendAction('cancel_modal');
        }
    }
});
