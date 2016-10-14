import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';

var PREFIX = config.APP.NAMESPACE;

var ActivityRepo = Ember.Object.extend({
  ActivityDeserializer: inject('activity'),
  find(model, plural, pk, ticket) {
    // if no ticket yet or ticket is not dirty
    if (!ticket.get('id') || ticket.get('isNotDirtyOrRelatedNotDirty')) {
      return PromiseMixin.xhr(`${PREFIX}/${plural}/${pk}/activity/`, 'GET').then((response) => {
        this.get('ActivityDeserializer').deserialize(response);
        let filter = function(activity) {
          return activity.get(`${model}`) === pk;
        };
        return this.get('simpleStore').find('activity', filter);
      });
    } else {
      return [];
    }
  },
});
export default ActivityRepo;
