import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';

var FindByIdRepo = Ember.Mixin.create({
  error: Ember.inject.service(),
  findById(id, model){
    const url = this.get('url');
    const errorUrl = this.get('errorUrl');
    const deserializer = this.get('deserializer');
    const modelInstance = this.get('store').find('dtd', id);
    PromiseMixin.xhr(`${url}${id}/`, 'GET').then((response) => {
      deserializer.deserialize(response, id);
    }, (xhr) => {
      if(xhr.status === 400 || xhr.status === 404){
        const err = xhr.responseJSON;
        const key = Object.keys(err);
        this.get('error').transToError(errorUrl);
        // return Ember.RSVP.Promise.reject(err[key[0]]);
      }
    });
    return modelInstance;
  }
});

export default FindByIdRepo;
