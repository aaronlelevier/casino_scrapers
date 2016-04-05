import Ember from 'ember';

export default Ember.Helper.helper((params) => {
  return parseInt(params[0], 10) === 100 ? 'progress-bar' : 'progress-bar progress-bar-success';
});
