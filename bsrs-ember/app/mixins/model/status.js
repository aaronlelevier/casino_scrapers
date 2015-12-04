import Ember from 'ember';

var StatusMixin = Ember.Mixin.create({
    rollbackStatus() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if(status && status.get('id') !== status_fk) {
            this.change_status(status_fk);
        }
    },
    saveStatus() {
        let status = this.get('status');
        if (status) { this.set('status_fk', status.get('id')); }
    },
    statusIsDirty: Ember.computed('status', 'status_fk', function() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if (status) {
            return status.get('id') === status_fk ? false : true;
        }
    }),
    statusIsNotDirty: Ember.computed.not('statusIsDirty'),
    change_status(status_id) {
        let store = this.get('store');
        const id = this.get('id');
        const old_status = this.get('status');
        if(old_status) {
            const people_ids = old_status.get('people');
            let updated_old_status_people = people_ids.filter((id) => {
                return id !== id; 
            });
            old_status.set('people', updated_old_status_people);
        }
        const new_status = store.find('status', status_id);
        const new_status_people = new_status.get('people') || [];
        new_status.set('people', new_status_people.concat(id));
    },
    status: Ember.computed.alias('belongs_to_status.firstObject'),
    belongs_to_status: Ember.computed(function() {
        const status_fk = this.get('status_fk');
        const filter = (status) => {
            return Ember.$.inArray(this.get('id'), status.get('people')) > -1;
        };
        return this.get('store').find('status', filter, ['people']);
    }),
});

export default StatusMixin;
