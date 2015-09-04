import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

var store;

moduleForComponent('locations/new-location', 'integration: location-new test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-level']);
        translation.initialize(this);
    }
});

test('selecting a location level will append the location id to the location level selected', function(assert) {
    var location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany, locations: [LOCATION_DEFAULTS.unusedId]});
    var location_level_one = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, locations: []});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, location_level_fk: undefined});
    var all_location_levels = store.find('location-level');
    this.set('model', location);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{locations/new-location model=model all_location_levels=all_location_levels}}`);
    var $component = this.$('.t-location-level');
    assert.equal(this.$('.t-location-level option:eq(0)').text(), 'Select One');
    assert.equal(this.$('.t-location-level option:eq(1)').text(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.equal(this.$('.t-location-level option:eq(2)').text(), LOCATION_LEVEL_DEFAULTS.nameDistrict);
    assert.equal(location.get('location_level'), undefined);
    assert.ok(location_level_one.get('notDirty'));
    assert.ok(location_level_two.get('notDirty'));
    this.$('.t-location-level').val(LOCATION_LEVEL_DEFAULTS.idTwo).trigger('change');
    assert.equal(location_level_two.get('locations.length'), 2);
    assert.deepEqual(location_level_two.get('locations'), [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]);
    assert.equal(location_level_one.get('locations.length'), 0);
    assert.deepEqual(location_level_one.get('locations'), []);
    assert.deepEqual(location.get('location_level').get('locations')[1], LOCATION_DEFAULTS.idOne);
    assert.deepEqual(location.get('location_level').get('id'), LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.ok(location_level_one.get('notDirty'));
    assert.ok(location_level_two.get('dirty'));
    this.$('.t-location-level').val(LOCATION_LEVEL_DEFAULTS.idOne).trigger('change');
    assert.equal(location_level_two.get('locations.length'), 1);
    assert.deepEqual(location_level_two.get('locations'), [LOCATION_DEFAULTS.unusedId]);
    assert.equal(location_level_one.get('locations.length'), 1);
    assert.deepEqual(location_level_one.get('locations'), [LOCATION_DEFAULTS.idOne]);
    assert.deepEqual(location.get('location_level').get('locations')[0], LOCATION_DEFAULTS.idOne);
    assert.deepEqual(location.get('location_level').get('id'), LOCATION_LEVEL_DEFAULTS.idOne);
    assert.ok(location_level_two.get('notDirty'));
    assert.ok(location_level_one.get('dirty'));
});

// test('user cannot enter current location level in store', function(assert) {
//     var location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany, locations: [LOCATION_DEFAULTS.unusedId]});
//     var location_level_one = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, locations: []});
//     var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, location_level_fk: undefined});
//     var all_location_levels = store.find('location-level');
//     this.set('model', location);
//     this.set('all_location_levels', all_location_levels);
//     this.render(hbs`{{locations/new-location model=model all_location_levels=all_location_levels}}`);
// });
