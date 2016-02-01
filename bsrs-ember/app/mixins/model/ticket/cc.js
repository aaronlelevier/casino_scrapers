import Ember from 'ember';
import { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids } from 'bsrs-components/attr/many-to-many';

var run = Ember.run;

var CCMixin = Ember.Mixin.create({
    cc_ids: many_models_ids('cc'),
    cc: many_models('ticket_cc', 'person_pk', 'person'),
    ticket_cc_ids: many_to_many_ids('ticket_cc'),
    ticket_cc: many_to_many('ticket-person', 'ticket_pk'),
    add_person: add_many_to_many('ticket-person', 'person', 'person_pk', 'ticket_pk'),
    remove_person: remove_many_to_many('ticket-person', 'person_pk', 'ticket_cc'),
    rollbackCC: many_to_many_rollback('ticket-person', 'ticket_people_fks', 'ticket_pk'),
    saveCC: many_to_many_save('ticket', 'ticket_cc', 'ticket_cc_ids', 'ticket_people_fks'),
});

export default CCMixin;

