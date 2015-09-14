import Ember from 'ember';

var RollbackModalMixin = Ember.Mixin.create({
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model ? this.currentModel.model : this.currentModel;
            if (model.get('isDirtyOrRelatedDirty')) {
                Ember.$('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                transition.abort();
            } else {
                if (model.get('id')) {
                    model.rollbackRelated();
                }
                Ember.$('.t-modal').modal('hide');
            }
        }
    }
});

export default RollbackModalMixin;
