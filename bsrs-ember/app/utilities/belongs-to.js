import Ember from 'ember';

var belongs_to = function(...args) {
    const [collection, name] = args;
    return Ember.computed(function() {
        const id = this.get('id');
        const filter = (related) => {
            const many = Ember.get(related, collection);
            return Ember.$.inArray(id, many) > -1;
        };
        return this.get('store').find(name, filter);
    }).property().readOnly();
};

var change_belongs_to = function(...args) {
    const [collection, name, this_related_model] = args;
    return function(new_related_pk) {
        const store = this.get('store');
        const related = this_related_model || name;
        const current_related = this.get(related);
        if(current_related) {
            const current_related_existing = current_related.get(collection);
            const updated_current_related_existing = current_related_existing.filter((id) => { 
                return id !== this.get('id');
            }); 
            const current_related_pojo = {id: current_related.get('id')};
            current_related_pojo[collection] = updated_current_related_existing; 
            Ember.run(() => {
                store.push(name, current_related_pojo); 
            });
        }
        const new_related = store.find(name, new_related_pk);
        const new_related_existing = new_related.get(collection) || [];
        const new_related_pojo = {id: new_related.get('id')};
        new_related_pojo[collection] = new_related_existing.concat(this.get('id')); 
        Ember.run(() => {
            store.push(name, new_related_pojo); 
        });
    };
};

var belongs_to_dirty = function(...args) {
    const [has_many_fk, name] = args;
    return Ember.computed(name,has_many_fk, function() {
        const has_many = this.get(name);
        const fk = this.get(has_many_fk);
        if (has_many) {
            return has_many.get('id') === fk ? false : true;
        }
        if(!has_many && fk) {
            return true;
        }
    });
};

var belongs_to_rollback = function(...args) {
    const [has_many_fk_name, name, func_name] = args;
    return function() {
        const has_many_model = this.get(name);
        const has_many_fk = this.get(has_many_fk_name);
        if(has_many_model && has_many_model.get('id') !== has_many_fk) {
            this[func_name](has_many_fk);
        }
    };
};

var belongs_to_save = function(...args) {
    const [model, name, has_many_fk_name] = args;
    return function() {
        const pk = this.get('id');
        const has_many_model = this.get(name);
        if (has_many_model) {
            const updated_this = {id: pk};
            updated_this[has_many_fk_name] = has_many_model.get('id');
            Ember.run(() => {
                this.get('store').push(model, updated_this);
            });
        }
    };
};

export { belongs_to, change_belongs_to, belongs_to_dirty, belongs_to_rollback, belongs_to_save };
