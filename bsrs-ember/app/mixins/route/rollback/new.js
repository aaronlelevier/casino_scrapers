import Ember from 'ember';

var NewRollbackModalMixin = Ember.Mixin.create({
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model ? this.currentModel.model : this.currentModel;
            if (model.get('isNewAndNotDirty')) {
                model.removeRecord();
                Ember.$('.t-modal').modal('hide');
            } else if (model.get('isDirty')) {
                Ember.$('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                transition.abort();
            }
        }
    }
});

export default NewRollbackModalMixin;
