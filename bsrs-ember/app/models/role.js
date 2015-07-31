import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

export default Model.extend({
    store: inject('main'),
    categories: Ember.computed('id', function() {
        var store = this.get('store');
        return store.find('category', {role_id: this.get('id')});
    }),
    serialize() {
        var categories = this.get('categories').map((category) => {
            return category.serialize();
        });
        return {
            id: this.get('id'),
            name: this.get('name'),
            role_type: this.get('role_type'),
            categories: categories
        };
    }
});
