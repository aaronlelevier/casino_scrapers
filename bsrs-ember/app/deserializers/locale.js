import Ember from 'ember';


var LocaleDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(model, id) {
        let store = this.get('simpleStore');
        let obj = store.push('locale', model);
        obj.save();
    },
    deserialize_list(response) {
        let store = this.get('simpleStore');
        response.results.forEach((json) => {
            let obj = store.push('locale', {id: json});
            obj.save();
        });
    }
});

export default LocaleDeserializer;
