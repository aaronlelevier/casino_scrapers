import Ember from 'ember';

var run = Ember.run;

var ParentMixin = Ember.Mixin.create({
    location_parents_fks: [],
    parents_ids: Ember.computed('parents.[]', function() {
        return this.get('parents').mapBy('id'); 
    }),
    parents: Ember.computed('location_parents.[]', function() {
        const location_parents = this.get('location_parents'); 
        const filter = function(parent) {
            const parent_pks = this.mapBy('parent_pk');
            return Ember.$.inArray(parent.get('id'), parent_pks) > -1;
        };
        return this.get('store').find('location', filter.bind(location_parents));
    }),
    location_parents_ids: Ember.computed('location_parents.[]', function() {
        return this.get('location_parents').mapBy('id'); 
    }),
    location_parents: Ember.computed(function() {
        const pk = this.get('id');
        const filter = (join_model) => {
            return join_model.get('location_pk') === pk && !join_model.get('removed');
        };
        return this.get('store').find('location-parents', filter);
    }),
    add_parent(parent) {
        const store = this.get('store'); 
        const new_parent = store.push('location', parent);
        const parent_id = new_parent.get('id');
        const location_parents = store.find('location-parents').toArray();
        //check existing
        let existing = location_parents.filter((m2m) => {
            return m2m.get('parent_pk') === parent_id;
        }).objectAt(0);
        run(() => {
            if(existing){ store.push('location-parents', {id: existing.get('id'), removed: undefined}); }
            else{ store.push('location-parents', {id: Ember.uuid(), location_pk: this.get('id'), parent_pk: parent_id}); }
        });
    },
    remove_parent(parent_id) {
        const store = this.get('store'); 
        const m2m_pk = this.get('location_parents').filter((m2m) => {
            return m2m.get('parent_pk') === parent_id;
        }).objectAt(0).get('id'); 
        run(() => {
            store.push('location-parents', {id: m2m_pk, removed: true});
        });
    },
    saveParents() {
        const location_parents = this.get('location_parents');
        const location_parents_ids = this.get('location_parents_ids') || [];
        const previous_m2m_fks = this.get('location_parents_fks') || [];
        //add
        location_parents.forEach((join_model) => {
            if (Ember.$.inArray(join_model.get('id'), previous_m2m_fks) === -1) {
                //TODO: use concat but won't work for multiple
                // store.push('location', {id: location_id, location_parents_fks: previous_m2m_fks.concat(join_model.get('id'))});
                previous_m2m_fks.pushObject(join_model.get('id'));
            } 
        });
        //remove
        for (let i=previous_m2m_fks.length-1; i>=0; --i) {
            if (Ember.$.inArray(previous_m2m_fks[i], location_parents_ids) === -1) {
                previous_m2m_fks.removeObject(previous_m2m_fks[i]);
            } 
        }
    },
});

export default ParentMixin;
