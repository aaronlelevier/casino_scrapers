import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

/* FindById
* @return {Promise} - if not dirty (never optimistic render).
* @return {obj} - optimistic render if not dirty.  Assumes won't hit error.  Probably not a good idea
* @return {obj} - if dirty don't fetch again and prevent overriding state
* @param [array] otherXhrs - if passed, override must be passed as well in order to cause model hook to pause (data might be not store bound, thus
* would lose info if model hook returned early)
*/
var FindById = Ember.Mixin.create({
  findByIdScenario(model, pk, deps, override=false, otherXhrs=[]){
    /* jshint ignore:start */
    if (override || !model.get('id') || model.get('isNotDirtyOrRelatedNotDirty')) {
      return Ember.RSVP.hash({
        model: this.get('repository').findById(pk),
        otherXhrs: Ember.RSVP.all(otherXhrs),
        ...deps
      });
    } else if(model.get('isDirtyOrRelatedDirty')){
      return { model, ...deps };
    }
    /* jshint ignore:end */
  }
});

export default FindById;
