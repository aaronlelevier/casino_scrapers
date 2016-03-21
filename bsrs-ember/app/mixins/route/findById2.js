import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var FindById = Ember.Mixin.create({
    findByIdScenario(model, pk, deps){
        /* jshint ignore:start */
        if (!model.get('id') || model.get('isNotDirtyOrRelatedNotDirty')) {
            return new Ember.RSVP.Promise((resolve, reject) => {
                this.get('repository').findById(pk).then((model) => {
                    resolve({ model, ...deps });
                }).catch((response) => {
                    reject(response); 
                });
            });
        } else if (model.get('isDirtyOrRelatedDirty')){
            return { model, ...deps };
        }
        /* jshint ignore:end */
    }
});
export default FindById;

