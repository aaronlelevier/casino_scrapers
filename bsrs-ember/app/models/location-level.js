import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

var LocationLevel = Model.extend({
    name: attr(),
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
        };
    }
});

export default LocationLevel;
