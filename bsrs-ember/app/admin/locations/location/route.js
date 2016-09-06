import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import ContactRouteMixin from 'bsrs-ember/mixins/route/contact';
import FindById from 'bsrs-ember/mixins/route/findById';

var LocationRoute = TabRoute.extend(FindById, ContactRouteMixin, {
  repository: inject('location'),
  redirectRoute: 'admin.locations.index',
  module: 'location',
  templateModelField: Ember.computed(function() { return 'name'; }),
  model(params) {
    const pk = params.location_id;
    const repository = this.get('repository');
    let location = repository.fetch(pk);
    const all_location_levels = this.get('simpleStore').find('location-level');
    const all_statuses = this.get('simpleStore').find('location-status');
    const email_types = this.email_type_repo.find();
    const default_email_type = this.email_type_repo.get_default();
    const phone_number_types = this.phone_number_type_repo.find();
    const default_phone_number_type = this.phone_number_type_repo.get_default();
    const address_types = this.address_type_repo.find();
    const default_address_type = this.address_type_repo.get_default();
    return this.findByIdScenario(location, pk, {all_statuses:all_statuses, all_location_levels:all_location_levels,
                                 email_types:email_types, default_email_type:default_email_type,
                                 phone_number_types:phone_number_types,default_phone_number_type:default_phone_number_type,
                                 address_types:address_types, default_address_type:default_address_type,
                                 repository:repository});

  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default LocationRoute;
