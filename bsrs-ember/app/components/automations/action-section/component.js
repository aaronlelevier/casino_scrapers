import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
  repository: injectRepo('automation'),
  actions: {
    selected() {
    // TODO: change the action type for the action here
    }
  }
});