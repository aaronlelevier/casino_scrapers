import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Object.extend({
  store: inject('main'),
  parent: Ember.computed(function(){
    var doc_type = this.get('doc_type');
    var doc_id = this.get('id');
    return this.get('store').find(doc_type, doc_id);
  }),
  doc_title: Ember.computed(function(){
    return this.get('parent.fullname');
  }),
  changed_doc_title: Ember.observer('parent.fullname', function(){
    this.set('doc_title', this.get('parent.fullname'));
  })
});
