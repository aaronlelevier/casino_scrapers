import Ember from 'ember';

export default Ember.Mixin.create({
  saveRelatedContainer(relatedModel) {
    this.get(relatedModel).forEach((model) => {
      model.saveRelated();
      model.save();
    });
  },
  rollbackRelatedContainer(relatedModel) {
    this.get(relatedModel).forEach((model) => {
      model.rollback();
    });
  }
});
