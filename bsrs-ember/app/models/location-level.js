import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import NewMixin from 'bsrs-ember/mixins/model/new';

var LocationLevel = Model.extend(NewMixin, {
    store: inject('main'),
    name: attr(''),
    locations: attr([]),
    roles: attr([]),
    children_fks: attr([]),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        return this.get('isDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    rollbackRelated() {
    },
    serialize() {
        var levels = [];
        let children = this.get('children') || [];
        children.forEach((model) => {
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
    children: Ember.computed('children_fks', function() {
        let children_fks = this.get('children_fks');
        let filter = (loc_level) => {
            return Ember.$.inArray(loc_level.get('id'), children_fks) > -1 && loc_level.get('name') !== this.get('name');
        };
        return this.get('store').find('location-level', filter.bind(this), ['id', 'children']);
    })
});

export default LocationLevel;
