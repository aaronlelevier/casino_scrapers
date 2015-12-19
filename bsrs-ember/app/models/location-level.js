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
    parent_fks: [],
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        return this.get('isDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    rollbackRelated() {
        this.rollbackChildren();
    },
    rollbackChildren() {
        this.set('children_fks', this.get('_oldState').children_fks);
    },
    serialize(id) {
        const children = this.get('children');
        const children_fks = children.mapBy('id');
        if(id) { this.set('id', id); }
        return {
            id: id || this.get('id'),
            name: this.get('name'),
            children: children_fks
        };
    },
    set_children(new_children) {
        this.set('children_fks', new_children.mapBy('id')); 
    },
    removeRecord() {
        this.get('store').remove('location-level', this.get('id'));
    },
    children: Ember.computed('children_fks.[]', function() {
        const children_fks = this.get('children_fks');
        const filter = (loc_level) => {
            return Ember.$.inArray(loc_level.get('id'), children_fks) > -1 && loc_level.get('name') !== this.get('name');
        };
        return this.get('store').find('location-level', filter.bind(this), ['id']);
    }),
    parents: Ember.computed('parent_fks.[]', function() {
        const parent_fks = this.get('parent_fks');
        const filter = (loc_level) => {
            return Ember.$.inArray(loc_level.get('id'), parent_fks) > -1 && loc_level.get('name') !== this.get('name');
        };
        return this.get('store').find('location-level', filter.bind(this), ['id']);
    }),
    toString: function() {
        const name = this.get('name');
        return name ? name : '';
    },
    saveRelated() {}
});

export default LocationLevel;
