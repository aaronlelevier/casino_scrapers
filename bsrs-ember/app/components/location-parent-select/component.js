import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import inject from 'bsrs-ember/utilities/inject';

var LocationParentMulti = Ember.Component.extend({
    repository: inject('location'),
    actions: {
        change_parent(new_parent_selection) {
            const location = this.get('location');
            const old_parent_selection = location.get('parents');
            const old_parent_ids = location.get('parents_ids');
            const new_parent_ids = new_parent_selection.mapBy('id');
            new_parent_selection.forEach((parent) => {
                if (Ember.$.inArray(parent.id, old_parent_ids) < 0) {
                    location.add_parent(parent);
                }
            });
            old_parent_selection.forEach((old_parent) => {
                if (Ember.$.inArray(old_parent.get('id'), new_parent_ids) < 0) {
                    location.remove_parent(old_parent.get('id'));
                }
            }); 
        },
        update_filter(search) {
            const llevel_id = this.get('location.location_level.id') ? this.get('location.location_level.id') : this.get('location.top_location_level.id');
            const repo = this.get('repository');
            return new Ember.RSVP.Promise((resolve, reject) => {
                Ember.run.later(() => {
                    if (Ember.isBlank(search)) { return resolve([]); }
                    resolve(repo.findLocationParents(llevel_id, search));
                }, config.DEBOUNCE_TIMEOUT_INTERVAL);
            });
        }
    }
});

export default LocationParentMulti;

