import Ember from 'ember';
const { run } = Ember;
import { change_belongs_to } from 'bsrs-components/attr/belongs-to';


var TicketLocationMixin = Ember.Mixin.create({
  remove_location() {
    let ticket_id = this.get('id');
    let store = this.get('simpleStore');
    let old_location = this.get('location');
    if(old_location) {
      let old_location_tickets = old_location.get('tickets') || [];
      let updated_old_location_tickets = old_location_tickets.filter((id) => {
        return id !== ticket_id;
      });
      run(() => {
        store.push('related-location', {id: old_location.get('id'), tickets: updated_old_location_tickets});
      });
    }
  },
  location_status_setup(location_json) {
    const pushed_location = this.get('simpleStore').push('related-location', location_json);
    // pushed_location.change_status(location_json.status_fk);
    return pushed_location;
  },
  change_location(location_json){
    // location_json.location_level_fk = location_json.location_level;
    // delete location_json.location_level;
    // if(location_json.status_fk){
    //   this.location_status_setup(location_json);
    // }
    this.change_location_container(location_json);
    // let location = this.get('simpleStore').find('related-location', location_json.id);
    // if(location.get('id')){
    //   location.change_location_level(location_json.location_level_fk);
    //   location.save();
    // }
  },
  change_location_container: change_belongs_to('location'),//pass owning model when grabbing from add on directly
});

export default TicketLocationMixin;
