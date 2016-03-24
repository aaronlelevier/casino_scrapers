import Ember from 'ember';
import { belongs_to, change_belongs_to_fk, belongs_to_dirty, belongs_to_rollback, belongs_to_save } from 'bsrs-components/attr/belongs-to';

const { run } = Ember;

var StatusMixin = Ember.Mixin.create({
    rollbackStatus: belongs_to_rollback('status_fk', 'status', 'change_status'),
    // statusIsDirty: belongs_to_dirty('status_fk', 'status'),
    statusIsDirty: Ember.computed('status', 'status_fk', function() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if (typeof status === 'object') {
            return status.get('id') === status_fk ? false : true;
        }
    }),
    statusIsNotDirty: Ember.computed.not('statusIsDirty'),
    change_status: change_belongs_to_fk('people', 'status'),
    status: Ember.computed.alias('belongs_to_status.firstObject'),
    belongs_to_status: belongs_to('people', 'status'),
});

export default StatusMixin;
