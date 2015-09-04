import NewMixin from 'bsrs-ember/mixins/model/new';
import { attr, Model } from 'ember-cli-simple-store/model';

var AddressModel = Model.extend(NewMixin, {
    type: attr(),
    address: attr(),
    city: attr(),
    state: attr(),
    postal_code: attr(),
    country: attr(),
    serialize() {
        return {id: this.get('id'), type: this.get('type'), address: this.get('address'), city: this.get('city'), state: this.get('state'),
            postal_code: this.get('postal_code'), country: this.get('country'), person: this.get('person')};
    }
});

export default AddressModel;
