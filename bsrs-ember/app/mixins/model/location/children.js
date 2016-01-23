import Ember from 'ember';

var run = Ember.run;

var ChildrenMixin = Ember.Mixin.create({
    location_children_fks: [],
    children_ids: Ember.computed('children.[]', function() {
        return this.get('children').mapBy('id'); 
    }),
    children: Ember.computed('location_children.[]', function() {
        const location_children = this.get('location_children'); 
        const filter = function(child) {
            const child_pks = this.mapBy('child_pk');
            return Ember.$.inArray(child.get('id'), child_pks) > -1;
        };
        return this.get('store').find('location', filter.bind(location_children));
    }),
    location_children_ids: Ember.computed('location_children.[]', function() {
        return this.get('location_children').mapBy('id'); 
    }),
    location_children: Ember.computed(function() {
        const pk = this.get('id');
        const filter = (join_model) => {
            return join_model.get('location_pk') === pk && !join_model.get('removed');
        };
        return this.get('store').find('location-children', filter);
    }),
    add_child(child) {
        const store = this.get('store'); 
        const new_location = store.push('location', child);
        const child_id = new_location.get('id');
        const location_children = store.find('location-children').toArray();
        //check existing
        let existing = location_children.filter((m2m) => {
            return m2m.get('child_pk') === child_id;
        }).objectAt(0);
        run(() => {
            if(existing){ store.push('location-children', {id: existing.get('id'), removed: undefined}); }
            else{ store.push('location-children', {id: Ember.uuid(), location_pk: this.get('id'), child_pk: child_id}); }
        });
    },
    remove_child(child_id) {
        const store = this.get('store'); 
        const m2m_pk = this.get('location_children').filter((m2m) => {
            return m2m.get('child_pk') === child_id;
        }).objectAt(0).get('id'); 
        run(() => {
            store.push('location-children', {id: m2m_pk, removed: true});
        });
    },
    saveChildren() {
        const location_children = this.get('location_children');
        const location_children_ids = this.get('location_children_ids') || [];
        const previous_m2m_fks = this.get('location_children_fks') || [];
        //add
        location_children.forEach((join_model) => {
            if (Ember.$.inArray(join_model.get('id'), previous_m2m_fks) === -1) {
                //TODO: use concat but won't work for multiple
                // store.push('location', {id: location_id, location_children_fks: previous_m2m_fks.concat(join_model.get('id'))});
                previous_m2m_fks.pushObject(join_model.get('id'));
            } 
        });
        //remove
        for (let i=previous_m2m_fks.length-1; i>=0; --i) {
            if (Ember.$.inArray(previous_m2m_fks[i], location_children_ids) === -1) {
                previous_m2m_fks.removeObject(previous_m2m_fks[i]);
            } 
        }
    },
    rollbackChildren() {
        const store = this.get('store');
        const previous_m2m_fks = this.get('location_children_fks') || [];
        const m2m_array = store.find('location-children').toArray();
        const m2m_to_throw_out = m2m_array.filter((join_model) => {
            return Ember.$.inArray(join_model.get('id'), previous_m2m_fks) < 0 && !join_model.get('removed') && this.get('id') === join_model.get('location_pk');
        });
        run(() => {
            m2m_to_throw_out.forEach((join_model) => {
                store.push('ticket-person', {id: join_model.get('id'), removed: true});
            });
            previous_m2m_fks.forEach((pk) => {
                var m2m_to_keep = store.find('location-children', pk);
                if (m2m_to_keep.get('id')) {
                    store.push('location-children', {id: pk, removed: undefined});
                }
            });
        });
    }
});

export default ChildrenMixin;
