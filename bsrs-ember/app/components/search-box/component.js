import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['search-box'],
    actions: {
        rollback_model() {
            var transition = this.trx.attemptedTransition;
            var model = this.trx.attemptedTransitionModel;
            model.rollback();
            var phone_numbers = this.store.find('phonenumber', {person_id: model.get('id').toString()});
            phone_numbers.forEach((num) => {
                if (num.get('isDirty')) {
                   num.rollback(); 
                }
            });
            transition.retry();
            //rollback the model ... how?
            //this.sendAction('rollback_model');
        },
        cancel_modal() {
            this.sendAction('cancel_modal');
        }
    }
});
