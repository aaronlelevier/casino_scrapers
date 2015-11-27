import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import NewMixin from 'bsrs-ember/mixins/model/new';
import inject from 'bsrs-ember/utilities/store';

var LocationModel = Model.extend(NewMixin, {
    store: inject('main'),
    name: attr(''),
    number: attr(''),
    status: attr(),
    tickets: [],
    location_level_fk: undefined,
    locationLevelIsDirty: Ember.computed('location_levels.[]', 'location_level_fk', function() {
        const location_level_id = this.get('location_level.id');
        const location_level_fk = this.get('location_level_fk');
        if(location_level_id) {
            return location_level_id === location_level_fk ? false : true;
        }
        if(!location_level_id && location_level_fk) {
            return true;
        }
    }),
    locationLevelIsNotDirty: Ember.computed.not('locationLevelIsDirty'),
    location_level: Ember.computed.alias('location_levels.firstObject'),
    location_levels: Ember.computed(function() {
        let filter = (location_level) => {
            let location_pks = location_level.get('locations') || [];
            return Ember.$.inArray(this.get('id'), location_pks) > -1;
        };
        return this.get('store').find('location-level', filter.bind(this), ['locations']);
    }),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', function() {
        return this.get('isDirty') || this.get('locationLevelIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    change_location_level(new_location_level_id) {
        const location_id = this.get('id');
        const store = this.get('store');
        const old_location_level = this.get('location_level');
        if(old_location_level) {
            const old_locations = old_location_level.get('locations') || [];
            let updated_old_locations = old_locations.filter((id) => {
                return id !== location_id;
            });
            old_location_level.set('locations', updated_old_locations);
        }
        if(!new_location_level_id){
            return;
        } else{
            const new_location_level = store.find('location-level', new_location_level_id);
            const new_locations = new_location_level.get('locations') || [];
            new_location_level.set('locations', new_locations.concat(location_id));
        }
    },
    saveLocationLevel() {
        const location_level = this.get('location_level');
        if (location_level) {
            location_level.save();
            this.set('location_level_fk', this.get('location_level').get('id'));
        } else {
            this.set('location_level_fk', undefined);
        }
    },
    rollbackLocationLevel() {
        const location_level = this.get('location_level');
        const location_level_fk = this.get('location_level_fk');
        this.change_location_level(location_level_fk);
    },
    saveRelated() {
        this.saveLocationLevel();
    },
    rollbackRelated() {
        this.rollbackLocationLevel();
    },
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            number: this.get('number'),
            status: this.get('status'),
            location_level: this.get('location_level.id'),
            children: [],
            parents: []
        };
    },
    removeRecord() {
        this.get('store').remove('location', this.get('id'));
    }
});

export default LocationModel;
