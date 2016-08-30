import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import config from 'bsrs-ember/config/environment';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';
import ContactRouteMixin from 'bsrs-ember/mixins/route/contact';
import FindById from 'bsrs-ember/mixins/route/findById';

var PersonRoute = TabRoute.extend(FindById, ContactRouteMixin, {
  repository: inject('person'),
  status_repo: inject('status'),
  role_repo: inject('role'),
  i18n: Ember.inject.service(),
  queryParams: {
    role_change: {
      refreshModel: true
    }
  },
  redirectRoute: 'admin.people.index',
  module: 'person',
  templateModelField: Ember.computed(function() { return 'fullname'; }),
  model(params, transition) {
    const pk = params.person_id;
    const repository = this.get('repository');
    const roles = this.get('role_repo').get_default();
    const role_change = transition.queryParams.role_change;
    const email_types = this.email_type_repo.find();
    const default_email_type = this.email_type_repo.get_default();
    const phone_number_types = this.phone_number_type_repo.find();
    const default_phone_number_type = this.phone_number_type_repo.get_default();
    // const address_types = this.address_type_repo.find();
    // const default_address_type = this.address_type_repo.get_default();
    const countries = this.country_repo.find();
    const state_list = this.state_repo.find();
    const statuses = this.get('status_repo').find();
    const locales = this.get('simpleStore').find('locale');
    let person = repository.fetch(pk);
    /* Person's role is dirty, then always fetch. Why would I do that? */
    const override = person.get('roleIsDirty');
    const hashComponents = [
      {'title': this.get('i18n').t('admin.person.section.details'), 'component': 'people/detail-section', active: 'active', roles:roles,
      statuses:statuses, locales:locales},
      {'title': this.get('i18n').t('admin.person.section.credentials'), 'component': 'people/credentials-section', active: ''},
      {'title': this.get('i18n').t('admin.person.section.contact'), 'component': 'people/contact-section', active: ''},
    ];
    return this.findByIdScenario(person, pk, {email_types:email_types, default_email_type:default_email_type,
                                 phone_number_types:phone_number_types, default_phone_number_type:default_phone_number_type,
                                //  address_types:address_types, default_address_type:default_address_type,
                                 countries:countries, state_list:state_list, statuses:statuses,
                                 locales:locales, roles:roles, role_change:role_change, hashComponents:hashComponents,
                                 repository: repository}, override);
  },
  setupController(controller, hash) {
    controller.setProperties(hash);
  }
});

export default PersonRoute;
