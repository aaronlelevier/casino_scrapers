import Ember from 'ember';
const { computed } = Ember;
import inject from 'bsrs-ember/utilities/store';

var ActivityModel = Ember.Object.extend({
  simpleStore: Ember.inject.service(),
  to: computed.alias('belongs_to.firstObject'),
  belongs_to: computed('to_fk', function() {
    const type = this.get('type');
    const to_fk = this.get('to_fk');
    const filter = function(dynamic) {
      return dynamic.get('id') === to_fk;
    };
    const related = type === 'status' ? 'ticket-status' : type === 'priority' ? 'ticket-priority' : `activity/${type}`;
    return this.get('simpleStore').find(related, filter);
  }),
  from: computed.alias('belongs_from.firstObject'),
  belongs_from: computed('from_fk', function() {
    const type = this.get('type');
    const from_fk = this.get('from_fk');
    const filter = function(dynamic) {
      return dynamic.get('id') === from_fk;
    };
    const related = type === 'status' ? 'ticket-status' : type === 'priority' ? 'ticket-priority' : `activity/${type}`;
    return this.get('simpleStore').find(related, filter);
  }),
  person: computed.alias('belongs_person.firstObject'),
  belongs_person: computed('person_fk', function() {
    const person_fk = this.get('person_fk');
    const filter = function(person) {
      return person.get('id') === person_fk;
    };
    return this.get('simpleStore').find(`activity/person`, filter);
  }),
  automation: computed.alias('belongs_automation.firstObject'),
  belongs_automation: computed('automation_fk', function() {
    const automation_fk = this.get('automation_fk');
    const filter = function(automation) {
      return automation.get('id') === automation_fk;
    };
    return this.get('simpleStore').find(`activity/automation`, filter);
  }),
  added: computed(function() {
    const activity_id = this.get('id');
    const filter = function(cc) {
      return cc.get('activities').includes(activity_id);
    };
    return this.get('simpleStore').find('activity/cc-add', filter);
  }),
  removed: computed(function() {
    const activity_id = this.get('id');
    const filter = function(cc) {
      return cc.get('activities').includes(activity_id);
    };
    return this.get('simpleStore').find('activity/cc-remove', filter);
  }),
  send_sms: computed(function() {
    const activity_id = this.get('id');
    const filter = function(cc) {
      return cc.get('activities').includes(activity_id);
    };
    return this.get('simpleStore').find('activity/send-sms', filter);
  }),
  send_email: computed(function() {
    const activity_id = this.get('id');
    const filter = function(cc) {
      return cc.get('activities').includes(activity_id);
    };
    return this.get('simpleStore').find('activity/send-email', filter);
  }),
  added_attachment: computed(function() {
    const activity_id = this.get('id');
    const filter = function(attachment) {
      return attachment.get('activities').includes(activity_id);
    };
    return this.get('simpleStore').find('activity/attachment-add', filter);
  }),
  removed_attachment: computed(function() {
    const activity_id = this.get('id');
    const filter = function(attachment) {
      return attachment.get('activities').includes(activity_id);
    };
    return this.get('simpleStore').find('activity/attachment-remove', filter);
  }),
  categories_to: computed(function() {
    const activity_id = this.get('id');
    const filter = function(category) {
      return category.get('activities').includes(activity_id);
    };
    return this.get('simpleStore').find('activity/category-to', filter);
  }),
  categories_from: computed(function() {
    const activity_id = this.get('id');
    const filter = function(category) {
      return category.get('activities').includes(activity_id);
    };
    return this.get('simpleStore').find('activity/category-from', filter);
  }),
});

export default ActivityModel;
