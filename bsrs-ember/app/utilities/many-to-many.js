import Ember from 'ember';
import equal from 'bsrs-ember/utilities/equal';

var run = Ember.run;

var many_to_many = function(...args) {
    const [join_model, many_pk] = args;
    return Ember.computed(function() {
        const filter = (m2m) => {
            return m2m.get(many_pk) === this.get('id') && !m2m.get('removed');
        };
        return this.get('store').find(join_model, filter);
    });
};

var many_to_many_ids = function(...args) {
    const [m2m_models] = args;
    return Ember.computed(`${m2m_models}.[]`, function() {
        return this.get(m2m_models).mapBy('id'); 
    });
};

var many_models = function(...args) {
    const [m2m_models, many_pk, many] = args;
    return Ember.computed(`${m2m_models}.[]`, function() {
        const user_many_relateds = this.get(m2m_models);
        const filter = function(many_related) {
            const many_related_pks = this.mapBy(many_pk);
            return Ember.$.inArray(many_related.get('id'), many_related_pks) > -1;
        };
        return this.get('store').find(many, filter.bind(user_many_relateds));
    });
};


var many_models_ids = function(...args) {
    const [many] = args;
    return Ember.computed(`${many}.[]`, function() {
        return this.get(many).mapBy('id');
    });
};

var many_to_many_dirty = function(...args) {
    const [many, m2m_ids, m2m_fks] = args;
    return Ember.computed(`${many}.[]`, `${m2m_ids}.[]`, `${m2m_fks}.[]`, function() {
        const user_many_relateds = this.get(many);
        const user_many_relateds_ids = this.get(m2m_ids);
        const previous_m2m_fks = this.get(m2m_fks) || [];
        if(user_many_relateds.get('length') !== previous_m2m_fks.length) {
            return equal(user_many_relateds_ids, previous_m2m_fks) ? false : true;
        }
        return equal(user_many_relateds_ids, previous_m2m_fks) ? false : true;
    });
};

var many_to_many_rollback = function(...args) {
    const [join_model, join_model_fks, main_many_fk] = args;
    return function() {
        const store = this.get('store');
        const previous_m2m_fks = this.get(join_model_fks) || [];
        const m2m_array = store.find(join_model).toArray();
        const m2m_to_throw_out = m2m_array.filter((m2m) => {
            return Ember.$.inArray(m2m.get('id'), previous_m2m_fks) < 0 && !m2m.get('removed') && this.get('id') === m2m.get(main_many_fk);
        });
        run(function() {
            m2m_to_throw_out.forEach(function(m2m) {
                store.push(join_model, {id: m2m.get('id'), removed: true});
            });
            previous_m2m_fks.forEach((pk) => {
                var m2m_to_keep = store.find(join_model, pk);
                if (m2m_to_keep.get('id')) {
                    store.push(join_model, {id: pk, removed: undefined});
                }
            });
        });
    };
};

var many_to_many_save = function(...args) {
    const [m2m_models, m2m_models_ids, m2m_models_fks] = args;
    return function() {
        const user_many_relateds = this.get(m2m_models);
        const user_many_relateds_ids = this.get(m2m_models_ids) || [];
        const previous_m2m_fks = this.get(m2m_models_fks) || [];
        //add
        user_many_relateds.forEach((join_model) => {
            if (Ember.$.inArray(join_model.get('id'), previous_m2m_fks) === -1) {
                previous_m2m_fks.pushObject(join_model.get('id'));
            } 
        });
        //remove
        for (let i=previous_m2m_fks.length-1; i>=0; --i) {
            if (Ember.$.inArray(previous_m2m_fks[i], user_many_relateds_ids) === -1) {
                previous_m2m_fks.removeObject(previous_m2m_fks[i]);
            } 
        }
    };
};

var add_many_to_many = function(...args) {
    const [join_model, many, many_fk, main_many_fk] = args;
    return function(many_related) {
        const store = this.get('store');
        const new_many_related = store.push(many, many_related);
        const many_related_pk = new_many_related.get('id');
        //check for existing
        const user_people = store.find(join_model).toArray();
        let existing = user_people.filter((m2m) => {
            return m2m.get(many_fk) === many_related_pk;
        }).objectAt(0);
        const new_join_model = {id: Ember.uuid()};
        new_join_model[main_many_fk] = this.get('id');
        new_join_model[many_fk] = many_related_pk;
        run(() => {
            if(existing){ store.push(join_model, {id: existing.get('id'), removed: undefined}); }
            else{ store.push(join_model, new_join_model); }
        });
    };
};

var remove_many_to_many = function(...args) {
    const [join_model, many_fk, m2m_models] = args;
    return function(many_related_pk) {
        const store = this.get('store');
        const m2m_pk = this.get(m2m_models).filter((m2m) => {
            return m2m.get(many_fk) === many_related_pk;
        }).objectAt(0).get('id');
        run(() => {
            store.push(join_model, {id: m2m_pk, removed: true});
        });
    };
};

export { many_to_many, many_to_many_ids, many_to_many_dirty, many_to_many_rollback, many_to_many_save, add_many_to_many, remove_many_to_many, many_models, many_models_ids };
