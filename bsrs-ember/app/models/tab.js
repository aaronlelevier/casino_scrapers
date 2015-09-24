import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
  store: inject('main'),
  tabList: Ember.inject.service(),
  parent: Ember.computed(function(){
    return this.get('store').find(this.get('doc_type'), this.get('id'));
  })
});
