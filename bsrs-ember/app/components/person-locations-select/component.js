import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
// import PersonLocationsMixin from 'bsrs-ember/mixins/person/locations';

var PersonLocationsSelect = Ember.Component.extend({
    repository: inject('location'),
    store: injectStore('main'),
    person_locations_selected: Ember.computed('person.person_locations.[]', function() {
        let person = this.get('person');
        return person.get('locations');
    }),
    options: Ember.computed('person_location_ids.[]', 'locations_fetch.[]', 'person.role', function() {
        //options must be present for selected locations to populate selectize (line 586 contentArrayDidChange calls this._selectionDidChange();)
        //this bound array is updated when action getLocations is called and more locations are pushed into the store
        return this.get('store').find('location', {location_level_fk: this.get('person.role.location_level_fk')});
    }),
    //still need the following two computeds to fetch new locations when role is changed
    location_level_pk: Ember.computed('person.role', function() {
        let role = this.get('person.role');
        if(role && role.get('id')) {
            let location_level = role.get('location_level');
            return location_level ? location_level.get('id') : undefined;
        }
    }),
    all_locations: Ember.computed('location_level_pk', function() {
        let repo = this.get('repository');
        let location_level_pk = this.get('location_level_pk');
        return location_level_pk ? repo.findLocationSelect({location_level: location_level_pk}) : [];
    }),
    locations_fetch: Ember.computed('all_locations.[]', function() {
        let all = this.get('all_locations');
        let location_level_pk = this.get('location_level_pk');
        if(location_level_pk) {
            return Ember.ArrayProxy.extend({
                content: Ember.computed(function () {
                    return all.filter(function(location) {
                        let location_level = location.get('location_level');
                        return location_level && location_level.get('id') === location_level_pk;
                    });
                }).property('source.@each.location_level')
            }).create({
                source: all 
            });
        }
        return [];
    }),
    actions: {
        add(location) {
            //auto updates person's locations
            let person = this.get('person');
            let location_pk = location.get('id');
            person.add_locations(location_pk);
        },
        remove(location) {
            let person = this.get('person');
            let location_pk = location.get('id');
            person.remove_location(location_pk);
        },
        getLocations() {
           let store = this.get('store'); 
           let locations = this.get('locations_fetch');
           locations.forEach((location) => {
               store.push('location', location);
           });
        }
    }
});

export default PersonLocationsSelect;
