import Ember from 'ember';
const { 
  inject: { service }, 
  Component 
} = Ember;

export default Component.extend({
  currency: service(),
  classNames: ['animated-fast', 'fadeIn'],
});
