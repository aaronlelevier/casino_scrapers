import { attr, Model } from 'ember-cli-simple-store/model';

export default Model.extend({
    type: attr(),
    number: attr(),
    serialize: function () {
        return {id: this.get('id'), number: this.get('number'), type: this.get('type')};
    }
});
