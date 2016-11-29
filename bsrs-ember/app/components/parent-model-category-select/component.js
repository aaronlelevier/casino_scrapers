import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var ParentTicketCategorySelect = Ember.Component.extend({
  categoryRepo: inject('category'),
});

export default ParentTicketCategorySelect;
