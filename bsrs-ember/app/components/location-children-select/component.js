import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var LocationChildrenMulti = Ember.Component.extend({
    repository: inject('location'),
    actions: {
        change_children(new_children_selection) {
            const location = this.get('location');
            const old_children_selection = location.get('children');
            const old_children_ids = location.get('children_ids');
            const new_children_ids = new_children_selection.mapBy('id');
            new_children_selection.forEach((children) => {
                if (Ember.$.inArray(children.get('id'), old_children_ids) < 0) {
                    location.add_child(children.get('id'));
                }
            });
            old_children_selection.forEach((old_children) => {
                if (Ember.$.inArray(old_children.get('id'), new_children_ids) < 0) {
                    location.remove_child(old_children.get('id'));
                }
            }); 
        },
        update_filter(search) {
            const repo = this.get('repository');
            return new Ember.RSVP.Promise((resolve, reject) => {
                Ember.run.later(() => {
                    if (Ember.isBlank(search)) { return resolve([]); }
                    resolve(repo.findLocationChildren(search));
                }, 300);
            });
        }
    }
});

export default LocationChildrenMulti;

