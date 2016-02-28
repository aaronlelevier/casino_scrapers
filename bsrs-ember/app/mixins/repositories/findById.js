import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';

export default Ember.Mixin.create({
    findById(id, model){
        const url = this.get('url');
        const deserializer = this.get('deserializer');
        if(model){
            PromiseMixin.xhr(`${url}${id}/`, 'GET').then((response) => {
                deserializer.deserialize(response, id);
            }, (xhr) => {
                if(xhr.status === 400 || xhr.status === 404){
                    const err = xhr.responseJSON;
                    const key = Object.keys(err);
                    return Ember.RSVP.Promise.reject(err[key[0]]);
                } 
            });
            return model;
        }
        return PromiseMixin.xhr(`${url}${id}/`, 'GET').then((response) => {
            return deserializer.deserialize(response, id);
        }, (xhr) => {
            if(xhr.status === 400 || xhr.status === 404){
                const err = xhr.responseJSON;
                const key = Object.keys(err);
                return Ember.RSVP.Promise.reject(err[key[0]]);
            } 
        });
    
    }
});
