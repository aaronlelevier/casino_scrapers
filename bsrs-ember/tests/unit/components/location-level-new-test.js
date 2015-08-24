import {test, module} from 'qunit';
import LocationLevelNewComponent from "bsrs-ember/components/location-levels/new/component";
import Ember from 'ember';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

var registry, container, store;

module('unit: location-level new test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:location-level']);
    },
    afterEach() {
        container = null;
        registry = null;
        store = null;
    }
});

test('all location levels are filtered to not include self', (assert) => {
    var subject = new LocationLevelNewComponent({});
    var model = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany}); 
    var location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameRegion}); 
    var location_level_three = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idThree, name: LOCATION_LEVEL_DEFAULTS.nameDepartment}); 
    subject.set('all_location_levels', store.find('location-level'));
    subject.set('model', model);
    assert.equal(subject.get('filtered_location_levels').get('length'), 2);
});

// test('all children are filtered out from the available location levels', (assert) => {
//     var subject = new LocationLevelNewComponent({});
//     var model = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany}); 
//     var location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameRegion}); 
//     var location_level_three = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idThree, name: LOCATION_LEVEL_DEFAULTS.nameDepartment, parent_id: LOCATION_LEVEL_DEFAULTS.idOne}); 
//     subject.set('all_location_levels', store.find('location-level'));
//     subject.set('model', model);
//     assert.equal(subject.get('filtered_location_levels').get('length'), 1);
// });
