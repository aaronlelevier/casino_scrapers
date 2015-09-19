import Ember from 'ember';

var PersonLocationsMixin = Ember.Mixin.create({
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
    })
});

export default PersonLocationsMixin;
