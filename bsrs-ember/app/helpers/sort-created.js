import Ember from 'ember';

export function sortCreated(models) {
  return models[0] && models[0].sortBy('created').reverse();
}

export default Ember.Helper.helper(sortCreated);
