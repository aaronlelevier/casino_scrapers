import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import NewMixin from 'bsrs-ember/mixins/model/new';
import inject from 'bsrs-ember/utilities/store';

var LocationModel = Model.extend(NewMixin, {
    store: inject('main'),
    name: attr(''),
    number: attr(''),
    status_fk: undefined,
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
    status: Ember.computed.alias('belongs_to.firstObject'),
    belongs_to: Ember.computed(function() {
        let location_id = this.get('id');
        let filter = function(status) {
            let locations = status.get('locations');
            return Ember.$.inArray(location_id, locations) > -1;
        };
        return this.get('store').find('location-status', filter, ['locations']);
    }),
    statusIsDirty: Ember.computed('status', 'status_fk', function() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if (status) {
            return status.get('id') === status_fk ? false : true;
        }
        if(!status && status_fk) {
            return true;
        }
    }),
    statusIsNotDirty: Ember.computed.not('statusIsDirty'),
    change_status(new_status_id) {
        let location_id = this.get('id');
        let store = this.get('store');
        let old_status = this.get('status');
        if(old_status) {
            let old_status_locations = old_status.get('locations') || [];
            let updated_old_status_locations = old_status_locations.filter((id) => {
                return id !== location_id;
            });
            old_status.set('locations', updated_old_status_locations);
        }
        let new_status = store.find('location-status', new_status_id);
        let new_status_locations = new_status.get('locations') || [];
        if (new_status_locations) {
            new_status.set('locations', new_status_locations.concat(location_id));
        }
    },
    saveStatus() {
        let status = this.get('status');
        if (status) { this.set('status_fk', status.get('id')); }
    },
    rollbackStatus() {
        let status = this.get('status');
        let status_fk = this.get('status_fk');
        if(status && status.get('id') !== status_fk) {
            this.change_status(status_fk);
        }
    },
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'locationLevelIsDirty', 'statusIsDirty', function() {
        var x = this.get('isDirty') || this.get('locationLevelIsDirty') || this.get('statusIsDirty');
        return x;
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
        this.saveStatus();
    },
    rollbackRelated() {
        this.rollbackLocationLevel();
        this.rollbackStatus();
    },
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            number: this.get('number'),
            status: this.get('status.id'),
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
