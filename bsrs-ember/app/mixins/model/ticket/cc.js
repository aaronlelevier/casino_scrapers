import Ember from 'ember';

var run = Ember.run;

var CCMixin = Ember.Mixin.create({
    cc_ids: Ember.computed('cc.[]', function() {
        return this.get('cc').mapBy('id');
    }),
    cc: Ember.computed('ticket_cc.[]', function() {
        const ticket_cc = this.get('ticket_cc');
        const filter = function(person) {
            const person_pks = this.mapBy('person_pk');
            return Ember.$.inArray(person.get('id'), person_pks) > -1;
        };
        return this.get('store').find('person', filter.bind(ticket_cc));
    }),
    ticket_cc_ids: Ember.computed('ticket_cc.[]', function() {
        return this.get('ticket_cc').mapBy('id'); 
    }),
    ticket_cc: Ember.computed(function() {
        const ticket_pk = this.get('id');
        const filter = (join_model) => {
            return join_model.get('ticket_pk') === ticket_pk && !join_model.get('removed');
        };
        return this.get('store').find('ticket-person', filter);
    }),
    add_person(person_pk) {
        const ticket_pk = this.get('id');
        const store = this.get('store');
        //check for existing
        const ticket_people = store.find('ticket-person').toArray();
        run(() => {
            // ticket_people.forEach((tp) => {
            //     if (tp.get('person_pk') === person_pk) {
            //         store.push('ticket-person', {id: tp.get('id'), removed: undefined});
            //     }
            // });
            store.push('ticket-person', {id: Ember.uuid(), ticket_pk: ticket_pk, person_pk: person_pk});
        });
    },
    remove_person(person_pk) {
        const store = this.get('store');
        const m2m_pk = this.get('ticket_cc').filter((m2m) => {
            return m2m.get('person_pk') === person_pk;
        }).objectAt(0).get('id');
        run(() => {
            store.push('ticket-person', {id: m2m_pk, removed: true});
        });
    },
    rollbackCC() {
        const store = this.get('store');
        const previous_m2m_fks = this.get('ticket_people_fks') || [];
        const m2m_array = store.find('ticket-person').toArray();
        const m2m_to_throw_out = m2m_array.filter((join_model) => {
            return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed') && this.get('id') === join_model.get('ticket_pk');
        });
        run(function() {
            m2m_to_throw_out.forEach(function(join_model) {
                store.push('ticket-person', {id: join_model.get('id'), removed: true});
            });
            previous_m2m_fks.forEach((pk) => {
                var m2m_to_keep = store.find('ticket-person', pk);
                if (m2m_to_keep.get('id')) {
                    store.push('ticket-person', {id: pk, removed: undefined});
                }
            });
        });
    },
    saveCC() {
        const ticket_cc = this.get('ticket_cc');
        const ticket_cc_ids = this.get('ticket_cc_ids') || [];
        const previous_m2m_fks = this.get('ticket_people_fks') || [];
        //add
        ticket_cc.forEach((join_model) => {
            if (Ember.$.inArray(join_model.get('id'), previous_m2m_fks) === -1) {
                previous_m2m_fks.pushObject(join_model.get('id'));
            } 
        });
        //remove
        for (let i=previous_m2m_fks.length-1; i>=0; --i) {
            if (Ember.$.inArray(previous_m2m_fks[i], ticket_cc_ids) === -1) {
                previous_m2m_fks.removeObject(previous_m2m_fks[i]);
            } 
        }
    },
});

export default CCMixin;

