import { attr, Model } from 'ember-cli-simple-store/model';

export default Model.extend({
    type: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    serialize() {
        return {id: this.get('id'), type: this.get('type'), address: this.get('address'), city: this.get('city'), state: this.get('state'), postal_code: this.get('postal_code'), country: this.get('country')};
    }
});
