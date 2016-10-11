import Ember from 'ember';
import { change_belongs_to } from 'bsrs-components/attr/belongs-to';

const { run } = Ember;

var LocationLevelMixin = Ember.Mixin.create({
  top_location_level: Ember.computed(function() {
    const filter = (llevel) => {
      return llevel.get('parents').get('length') === 0;
    };
    const llevels = this.get('simpleStore').find('location-level', filter);
    return llevels.objectAt(0);
  }).readOnly(),
  remove_children_parents() {
    const id = this.get('id');
    const store = this.get('simpleStore');
    const location_children = this.get('location_children');
    const location_parents = this.get('location_parents');
    const m2m_children_to_remove = location_children.reduce((arr, m2m) => {
      return m2m.get('location_pk') === id ? arr.concat(m2m.get('id')) : false;
    }, []);
    const m2m_parents_to_remove = location_parents.reduce((arr, m2m) => {
      return m2m.get('location_pk') === id ? arr.concat(m2m.get('id')) : false;
    }, []);
    m2m_children_to_remove.forEach((child) => {
      run(() => {
        store.push('location-children', {id: child, removed: true});
      });
    });
    m2m_parents_to_remove.forEach((child) => {
      run(() => {
        store.push('location-parents', {id: child, removed: true});
      });
    });
  },
  change_location_level(llevel_id){
    this.remove_children_parents();
    this.change_location_level_container(llevel_id); 
  },
  change_location_level_container: change_belongs_to('location_level'),
});

export default LocationLevelMixin;
