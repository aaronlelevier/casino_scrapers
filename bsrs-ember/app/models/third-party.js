import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

var ThirdPartyModel = Model.extend({
    name: attr(),
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            number: this.get('number'),
            status: this.get('status')
        };
    },
});

export default ThirdPartyModel;
