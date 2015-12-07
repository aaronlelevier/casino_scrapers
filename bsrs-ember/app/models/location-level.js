import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { attr, Model } from 'ember-cli-simple-store/model';

var LocationLevel = Model.extend(NewMixin, {
    store: inject('main'),
    name: attr(''),
    locations: [],
    roles: [],
    children_fks: attr([]),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        return this.get('isDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    rollbackRelated() {
    },
    serialize() {
        const children = this.get('children');
        const children_fks = children.mapBy('id');
        return {
            id: this.get('id'),
            name: this.get('name'),
            children: children_fks
        };
    },
    removeRecord() {
        this.get('store').remove('location-level', this.get('id'));
    },
    children: Ember.computed('children_fks.[]', function() {
        const children_fks = this.get('children_fks');
        const filter = (loc_level) => {
            return Ember.$.inArray(loc_level.get('id'), children_fks) > -1 && loc_level.get('name') !== this.get('name');
        };
        var x = this.get('store').find('location-level', filter.bind(this), ['id']);
        return x;
    }),
    toString: function() {
        const name = this.get('name');
        return name ? name : '';
    }
});

export default LocationLevel;
