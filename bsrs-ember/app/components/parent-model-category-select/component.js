import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

let ParentTicketCategorySelect = Ember.Component.extend({
  categoryRepo: inject('category'),
  disabled: false,
  readonly: false
});

export default ParentTicketCategorySelect;
