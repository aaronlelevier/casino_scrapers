import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import config from 'bsrs-ember/config/environment';
import injectStore from 'bsrs-ember/utilities/store';
import AddressType from 'bsrs-ember/models/address-type';
import PhoneNumberType from 'bsrs-ember/models/phone-number-type';

export default Ember.Route.extend({
    store: injectStore('main'),
    repository: inject('person'),
    state_repo: inject('state'),
    status_repo: inject('status'),
    country_repo: inject('country'),
    role_repo: inject('role'),
    phone_number_type_repo: inject('phone-number-type'),
    address_type_repo: inject('address-type'),
    translationsFetcher: Ember.inject.service(),
    i18n: Ember.inject.service(),
    personCurrent: Ember.inject.service(),
    model(params) {
        var person_pk = params.person_id,
            country_repo = this.get('country_repo'),
            state_repo = this.get('state_repo'),
            status_repo = this.get('status_repo'),
            role_repo = this.get('role_repo'),
            repository = this.get('repository'),
            person = repository.findById(person_pk),
            phone_number_type_repo = this.get('phone_number_type_repo'),
            default_phone_number_type = phone_number_type_repo.get_default(),
            address_type_repo = this.get('address_type_repo'),
            default_address_type = address_type_repo.get_default(),
            roles = role_repo.get_default();

        return Ember.RSVP.hash({
            model: person,
            phone_number_types: phone_number_type_repo.find(),
            countries: country_repo.find(),
            state_list: state_repo.find(),
            address_types: address_type_repo.find(),
            statuses: status_repo.find(),
            default_phone_number_type: default_phone_number_type,
            default_address_type: default_address_type,
            locales: this.get('store').find('locale'),
            roles: roles
        });

    },
    setupController(controller, hash) {
        controller.set('model', hash.model);
        controller.set('phone_number_types', hash.phone_number_types);
        controller.set('default_phone_number_type', hash.default_phone_number_type);
        controller.set('address_types', hash.address_types);
        controller.set('default_address_type', hash.default_address_type);
        controller.set('state_list', hash.state_list);
        controller.set('countries', hash.countries);
        controller.set('statuses', hash.statuses);
        controller.set('roles', hash.roles);
        controller.set('locales', hash.locales);
    },
    actions: {
        redirectUser() {
            this.transitionTo('admin.people');
        },
        localeChanged(locale){
            var personCurrent = this.get('personCurrent');
            var personCurrentId = personCurrent.get('model.id');
            var model = this.currentModel.model;
            model.set('locale', locale);
            if(personCurrentId === model.get('id')){
                config.i18n.currentLocale = locale;
                return this.get('translationsFetcher').fetch().then(function(){
                    this.get('i18n').set('locale', config.i18n.currentLocale);
                }.bind(this));
            }
        },
        willTransition(transition) {
            var model = this.currentModel.model ? this.currentModel.model : this.currentModel;
            if (model.get('isDirtyOrRelatedDirty')) {
                Ember.$('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                transition.abort();
            } else {
                if (model.get('id')) {
                    model.rollbackRelated();
                    this.send('localeChanged', model.get('locale'));
                }
                Ember.$('.t-modal').modal('hide');
            }
        }
    }
});
