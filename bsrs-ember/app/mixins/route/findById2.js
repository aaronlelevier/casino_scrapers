import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var FindById = Ember.Mixin.create({
  findByIdScenario(model, pk, deps){
    /* jshint ignore:start */
    if (model.get('target_id')) {
      return { model, pk, ...deps };
    } else if (!model.get('id') || model.get('isNotDirtyOrRelatedNotDirty')) {
      const model = this.get('repository').findById(pk);
      return { model, pk, ...deps };
    } else if (model.get('isDirtyOrRelatedDirty')){
      return { model, pk, ...deps };
    }
    /* jshint ignore:end */
  }
});
export default FindById;

