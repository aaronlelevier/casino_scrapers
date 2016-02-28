import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

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

