import Ember from 'ember';


var LocaleDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this._deserializeList(response);
        } else {
            this._deserializeSingle(response, options);
        }
    },
    _deserializeSingle(model, id) {
        let store = this.get('simpleStore');
        let obj = store.push('locale', model);
        obj.save();
    },
    _deserializeList(response) {
        let store = this.get('simpleStore');
        response.results.forEach((json) => {
            let obj = store.push('locale', {id: json});
            obj.save();
        });
    }
});

export default LocaleDeserializer;
