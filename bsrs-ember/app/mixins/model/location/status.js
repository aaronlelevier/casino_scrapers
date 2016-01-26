import Ember from 'ember';
import { belongs_to, change_belongs_to, belongs_to_dirty, belongs_to_rollback, belongs_to_save } from 'bsrs-ember/utilities/belongs-to';

var StatusMixin = Ember.Mixin.create({
    status: Ember.computed.alias('belongs_to.firstObject'),
    belongs_to: belongs_to('locations', 'location-status'),
    change_status: change_belongs_to('locations', 'location-status', 'status'),
    saveStatus: belongs_to_save('location', 'status', 'status_fk'),
    rollbackStatus: belongs_to_rollback('status_fk', 'status', 'change_status'),
});

export default StatusMixin;
