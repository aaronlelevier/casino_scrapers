import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';
import ContactRouteMixin from 'bsrs-ember/mixins/route/contact';

var LocationNewRoute = TabRoute.extend(ContactRouteMixin, {
  repository: inject('location'),
  redirectRoute: 'admin.locations.index',
  module: 'location',
  templateModelField: 'Location',
  model(params) {
    let new_pk = parseInt(params.new_id, 10);
    let all_location_levels = this.get('simpleStore').find('location-level');
    const all_statuses = this.get('simpleStore').find('location-status');
    let model = this.get('simpleStore').find('location', {new_pk: new_pk}).objectAt(0);
    const repository = this.get('repository');
    if(!model){
      model = repository.create(new_pk);
    }
    return Ember.RSVP.hash({
      model: model,
      all_statuses: all_statuses,
      all_location_levels: all_location_levels,
      email_types: this.email_type_repo.find(),
      default_email_type: this.email_type_repo.get_default(),
      phone_number_types: this.phone_number_type_repo.find(),
      default_phone_number_type: this.phone_number_type_repo.get_default(),
      address_types: this.address_type_repo.find(),
      default_address_type: this.address_type_repo.get_default(),
      repository: repository
    });
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default LocationNewRoute;
