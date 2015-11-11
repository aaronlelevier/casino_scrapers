import Ember from 'ember';

var extract_to_and_from = function(store, model) {
   store.push(`activity/${model.type}`, model.content.to);
   store.push(`activity/${model.type}`, model.content.from);
   model.to_fk = model.content.to.id;
   model.from_fk = model.content.from.id;
};

var extract_person = function(store, model) {
    store.push('activity/person', model.person);
    model.person_fk = model.person.id;
};

var ActivityDeserializer = Ember.Object.extend({
    deserialize(response, type) {
        let store = this.get('store');
        response.results.forEach((model) => {
            extract_to_and_from(store, model);
            delete model.content;
            extract_person(store, model);
            delete model.person;
            store.push('activity', model);
        });
    },
});

export default ActivityDeserializer;



