import Ember from 'ember';
import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';

let container, store, registry;

module('sco unit: location level deserializer test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:location-level']);
    },
    afterEach() {
        store = null;
        container = null;
        registry = null;
    }
});

test('sco location level correctly deserialized the children with no children (list)', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany });
    let loc_level_one = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idOne);
    loc_level_one.children = [{ id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameRegion }];
    let json = [loc_level_one, LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idTwo)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    let location_level_one = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.ok(!location_level_one.get('parent_id'));
    let location_level_two = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.equal(location_level_two.get('parent_id'), LOCATION_LEVEL_DEFAULTS.idOne);
});

test('location level correctly deserialized the children with children (list)', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, children: [{id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany}] });
    let loc_level_one = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idOne);
    loc_level_one.children = [{id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany}];
    let json = [loc_level_one, LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idTwo)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    let location_level_one = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.ok(!location_level_one.get('parent_id'));
    let location_level_two = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.equal(location_level_two.get('parent_id'), LOCATION_LEVEL_DEFAULTS.idOne);
});

test('location level correctly deserialized if has no children (detail)', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, children: [{ id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany }] });
    let json = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idTwo);
    subject.deserialize(json, LOCATION_LEVEL_DEFAULTS.idTwo);
    let location_level_one = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.ok(!location_level_one.get('parent_id'));
    let location_level_two = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.equal(location_level_two.get('parent_id'), LOCATION_LEVEL_DEFAULTS.idOne);
});

test('location level correctly deserialized if has children (detail)', (assert) => {
    let subject = LocationLevelDeserializer.create({store: store});
    let location_level = store.push('location-level', { id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany });
    let loc_level_one = LOCATION_LEVEL_FIXTURES.generate(LOCATION_LEVEL_DEFAULTS.idOne);
    loc_level_one.children = [{ id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameRegion }];
    subject.deserialize(loc_level_one, LOCATION_LEVEL_DEFAULTS.idOne);
    let location_level_one = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idOne);
    assert.ok(!location_level_one.get('parent_id'));
    let location_level_two = store.find('location-level', LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.equal(location_level_two.get('parent_id'), LOCATION_LEVEL_DEFAULTS.idOne);
});
