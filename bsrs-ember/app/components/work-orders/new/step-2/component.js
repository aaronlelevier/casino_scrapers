import Ember from 'ember';
const { computed, get, set } = Ember;

export default Ember.Component.extend({
  classNames: ['animated-fast', 'fadeIn'],
  today: new Date(),
});
