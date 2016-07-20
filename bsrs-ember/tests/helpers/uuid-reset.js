import Ember from 'ember';
import random, { uuid } from 'bsrs-ember/models/random';

export default Ember.Test.registerAsyncHelper('uuidReset', function(app) {
  random.uuid = uuid;
});
