import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var ContactRouteMixin = Ember.Mixin.create({
    phone_number_type_repo: inject('phone-number-type'),
    address_type_repo: inject('address-type'),
    email_type_repo: inject('email-type'),
    state_repo: inject('state'),
    country_repo: inject('country'),
    init() {
        const state_repo = this.get('state_repo');
        this.set('state_repo', state_repo);
        const country_repo = this.get('country_repo');
        this.set('country_repo', country_repo);
        const address_type_repo = this.get('address_type_repo');
        this.set('address_type_repo', address_type_repo);
        const phone_number_type_repo = this.get('phone_number_type_repo');
        this.set('phone_number_type_repo', phone_number_type_repo);
        const email_type_repo = this.get('email_type_repo');
        this.set('email_type_repo', email_type_repo);
    }
});

export default ContactRouteMixin;
