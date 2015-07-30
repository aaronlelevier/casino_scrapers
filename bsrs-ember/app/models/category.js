import { attr, Model } from 'ember-cli-simple-store/model';

export default Model.extend({
    name: attr(),
    status: attr(),
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
        };
    }
});
