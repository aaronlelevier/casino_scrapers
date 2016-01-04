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
        const type = this.get('type');
        const store = this.get('store');
        const pk = this.get('id');
        const status = this.get('status');
        if (status) {
            store.push(type, {id: pk, status_fk: status.get('id')});
        }
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
            store.push('status', {id: old_status.get('id'), people: updated_old_status_people});
        }
        const new_status = store.find('status', status_id);
        const new_status_people = new_status.get('people') || [];
        store.push('status', {id: new_status.get('id'), people: new_status_people.concat(id)});
    },
    status: Ember.computed.alias('belongs_to_status.firstObject'),
    belongs_to_status: Ember.computed(function() {
        const id = this.get('id');
        const filter = (status) => {
            return Ember.$.inArray(id, status.get('people')) > -1;
        };
        return this.get('store').find('status', filter);
    }),
});

export default StatusMixin;
