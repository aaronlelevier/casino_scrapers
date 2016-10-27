import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import { ClientError } from 'bsrs-ember/utilities/errors';

var FindByIdRepo = Ember.Mixin.create({
  findById(id){
    const url = this.get('url');
    const deserializer = this.get('deserializer');
    /*
    * If no existing model, return Promise to prevent optimistic rendering
    */
    return PromiseMixin.xhr(`${url}${id}/`, 'GET').then((response) => {
      return deserializer.deserialize(response, id);
    }, (xhr) => {
      if (xhr.status === 404) {
        const err = xhr.responseJSON;
        const key = Object.keys(err);
        return Ember.RSVP.Promise.reject( new ClientError(err[key[0]]) );
      }
    });

  }
});

export default FindByIdRepo;
