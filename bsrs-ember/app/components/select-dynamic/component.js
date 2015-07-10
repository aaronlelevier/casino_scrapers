import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['t-select'],
  repository: inject('state'),
  defineModel: function(){
    var repository = this.get('repository');
    var options = repository.find();
    this.set('model', options);
  }.on('init')
});
