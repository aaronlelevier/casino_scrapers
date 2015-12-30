import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

var ActivityModel = Ember.Object.extend({
    store: inject('main'),
    to: Ember.computed.alias('belongs_to.firstObject'),
    belongs_to: Ember.computed('to_fk', function() {
        const type = this.get('type');
        const to_fk = this.get('to_fk');
        const filter = function(dynamic) {
            return dynamic.get('id') === to_fk;
        };
        const related = type === 'status' ? 'ticket-status' : type === 'priority' ? 'ticket-priority' : `activity/${type}`;
        return this.get('store').find(related, filter);
    }),
    from: Ember.computed.alias('belongs_from.firstObject'),
    belongs_from: Ember.computed('from_fk', function() {
        const type = this.get('type');
        const from_fk = this.get('from_fk');
        const filter = function(dynamic) {
            return dynamic.get('id') === from_fk;
        };
        const related = type === 'status' ? 'ticket-status' : type === 'priority' ? 'ticket-priority' : `activity/${type}`;
        return this.get('store').find(related, filter);
    }),
    person: Ember.computed.alias('belongs_person.firstObject'),
    belongs_person: Ember.computed('person_fk', function() {
        const person_fk = this.get('person_fk');
        const filter = function(person) {
            return person.get('id') === person_fk;
        };
        return this.get('store').find(`activity/person`, filter);
    }),
    added: Ember.computed(function() {
        const activity_id = this.get('id');
        const filter = function(cc) {
            return Ember.$.inArray(activity_id, cc.get('activities')) > -1;
        };
        return this.get('store').find('activity/cc-add', filter);
    }),
    removed: Ember.computed(function() {
        const activity_id = this.get('id');
        const filter = function(cc) {
            return Ember.$.inArray(activity_id, cc.get('activities')) > -1;
        };
        return this.get('store').find('activity/cc-remove', filter);
    }),
    added_attachment: Ember.computed(function() {
        const activity_id = this.get('id');
        const filter = function(attachment) {
            return Ember.$.inArray(activity_id, attachment.get('activities')) > -1;
        };
        return this.get('store').find('activity/attachment-add', filter);
    }),
    removed_attachment: Ember.computed(function() {
        const activity_id = this.get('id');
        const filter = function(attachment) {
            return Ember.$.inArray(activity_id, attachment.get('activities')) > -1;
        };
        return this.get('store').find('activity/attachment-remove', filter);
    }),
    categories_to: Ember.computed(function() {
        const activity_id = this.get('id');
        const filter = function(category) {
            return Ember.$.inArray(activity_id, category.get('activities')) > -1;
        };
        return this.get('store').find('activity/category-to', filter);
    }),
    categories_from: Ember.computed(function() {
        const activity_id = this.get('id');
        const filter = function(category) {
            return Ember.$.inArray(activity_id, category.get('activities')) > -1;
        };
        return this.get('store').find('activity/category-from', filter);
    }),
});

export default ActivityModel;
