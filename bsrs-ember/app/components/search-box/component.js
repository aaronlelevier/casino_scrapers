import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['search-box'],
    actions: {
        rollback_model() {
            var transition = this.trx.attemptedTransition;
            var model = this.trx.attemptedTransitionModel;
            model.rollback();
            var phone_numbers = this.store.find('phonenumber', {person_id: model.get('id')});
            phone_numbers.forEach((num) => {
                if (num.get('isDirty')) {
                   num.rollback(); 
                }
            });
            transition.retry();
        },
        cancel_modal() {
            this.sendAction('cancel_modal');
        }
    }
});
