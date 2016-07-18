import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { attr, Model } from 'ember-cli-simple-store/model';

const { run } = Ember;

var LocationLevel = Model.extend(NewMixin, {
  simpleStore: Ember.inject.service(),
  name: attr(''),
  locations: [],
  roles: [],
  children_fks: attr([]),
  parent_fks: [],
  isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
    return this.get('isDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackChildren();
    this._super(...arguments);
  },
  rollbackChildren() {
    const store = this.get('simpleStore');
    store.push('location-level', {id: this.get('id'), children_fks: this.get('_oldState').children_fks});
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
  set_children(new_children) {
    this.set('children_fks', new_children.mapBy('id'));
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('location-level', this.get('id'));
    });
  },
  children: Ember.computed('children_fks.[]', function() {
    const children_fks = this.get('children_fks');
    const filter = (loc_level) => {
      return Ember.$.inArray(loc_level.get('id'), children_fks) > -1 && loc_level.get('name') !== this.get('name');
    };
    return this.get('simpleStore').find('location-level', filter.bind(this));
  }),
  parents: Ember.computed('parent_fks.[]', function() {
    const parent_fks = this.get('parent_fks');
    const filter = (loc_level) => {
      return Ember.$.inArray(loc_level.get('id'), parent_fks) > -1 && loc_level.get('name') !== this.get('name');
    };
    return this.get('simpleStore').find('location-level', filter.bind(this));
  }),
  toString: function() {
    const name = this.get('name');
    return name ? name : '';
  },
  saveRelated() {}
});

export default LocationLevel;
