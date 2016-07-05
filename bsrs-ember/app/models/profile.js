import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

const orderDefault = 0;

export default Model.extend({
  description: attr(''),
  assignee_id: attr(''),
  isNotDirtyOrRelatedNotDirty: Ember.computed(function(){
    return this.get('isNotDirty');
  }),
  isDirtyOrRelatedDirty: Ember.computed(function(){
    return this.get('isDirty');
  }),
  changeAssignee(obj) {
    this.set('assignee_id', obj.id);
    this.set('assignee', {id: obj.id, username: obj.username});
  },
  serialize() {
    return {
      id: this.get('id'),
      description: this.get('description'),
      assignee: this.get('assignee_id'),
    };
  },
});