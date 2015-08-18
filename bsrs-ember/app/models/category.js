import { attr, Model } from 'ember-cli-simple-store/model';

var CategoryModel = Model.extend({
    name: attr(),
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            description: this.get('description'),
            cost_amount: this.get('cost_amount'),
            cost_currency: this.get('cost_currency'),
            cost_code: this.get('cost_code'),
        };
    }
});

export default CategoryModel;
