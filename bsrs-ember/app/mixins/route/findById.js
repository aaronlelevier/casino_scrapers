import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

/* FindById
* @return {Promise} - if no current id in store or override is true (never optimistic render).  Going from grid to detail will
* trigger this case unless user has visited before
* @return {obj} - optimistic render if not dirty.  Assumes won't hit error.  Probably not a good idea
* @return {obj} - if dirty don't fetch again and prevent overriding state
*/
var FindById = Ember.Mixin.create({
  findByIdScenario(model, pk, deps, override=false){
    /* jshint ignore:start */
    if (override || !model.get('id')) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('repository').findById(pk).then((model) => {
          resolve({ model, ...deps });
        }).catch((response) => {
          reject(response);
        });
      });
    }else if(model.get('isNotDirtyOrRelatedNotDirty')){
      model = this.get('repository').findById(pk, model);
      return { model, ...deps };
    }else if(model.get('isDirtyOrRelatedDirty')){
      return { model, ...deps };
    }
    /* jshint ignore:end */
  }
});
export default FindById;
