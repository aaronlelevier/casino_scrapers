import Ember from 'ember';

export default Ember.Mixin.create({
  // fk
  saveRelatedBelongsTo(relatedModel) {
    let rm = this.get(relatedModel);
    if (rm) {
      rm.saveRelated();
    }
  },
  // m2m
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
