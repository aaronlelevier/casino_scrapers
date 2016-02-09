import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Mixin.create({
    store: inject('main'),
    removeTypeFromArray(model_id, related, type, related_join_pk_mapping) {
        Ember.run(() => {
            const store = this.get('store');
            const join_model = store.find(type, related.get('id'));
            let mapping = join_model.get(related_join_pk_mapping);
            const index = join_model.get(related_join_pk_mapping).indexOf(model_id);
            mapping = mapping.splice(index, 1);
            let new_related_model = {id: related.get('id')};
            new_related_model[related_join_pk_mapping] = mapping; 
            store.push(type, new_related_model);
        });
    },
});


