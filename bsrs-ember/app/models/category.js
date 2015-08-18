import { attr, Model } from 'ember-cli-simple-store/model';

var CategoryModel = Model.extend({
    name: attr(),
    status: attr(),
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
        };
    }
});

export default CategoryModel;
