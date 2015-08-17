import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import loopAttrs from 'bsrs-ember/utilities/loop-attrs';

var LocationLevel = Model.extend({
    store: inject('main'),
    name: attr(''),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        //for children eventually
        return this.get('isDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    rollbackRelated() {
    },
    serialize() {
        var levels = [];
        this.get('children').forEach(function(model) {
            levels.push(model.get('id'));
        });
        return {
            id: this.get('id'),
            name: this.get('name'),
            children: levels
        };
    },
    removeRecord() {
        this.get('store').remove('location-level', this.get('id'));
    },
    children: Ember.computed(function() {
        var filter = function(level) {
            var pk = this.get('id');
            var id = level.get('id');
            var parent_id = level.get('parent_id');
            return parent_id === pk && pk !== id;
        };
        return this.get('store').find('location-level', filter.bind(this), ['id', 'parent_id']);
    }),
    isNew: Ember.computed(function() {
        return loopAttrs(this, 'location_level');
    })
});

export default LocationLevel;
