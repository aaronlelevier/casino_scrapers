import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

var store;

moduleForComponent('location-single', 'integration: location-single test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-level']);
        translation.initialize(this);
    }
});

test('selecting a location level will append the location id to the new location level but remove it from the previous location level', function(assert) {
    var location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany, locations: [LOCATION_DEFAULTS.unusedId]});
    var location_level_one = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, locations: [LOCATION_DEFAULTS.idOne]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var all_location_levels = store.find('location-level');
    this.set('model', location);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{location-single model=model all_location_levels=all_location_levels}}`);
    var $component = this.$('.t-location-level');
    assert.equal(this.$('.t-location-level option:eq(0)').text(), 'Select One');
    assert.equal(this.$('.t-location-level option:eq(1)').text(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.equal(this.$('.t-location-level option:eq(2)').text(), LOCATION_LEVEL_DEFAULTS.nameDistrict);
    assert.deepEqual(location.get('location_level').get('locations'), [LOCATION_DEFAULTS.idOne]);
    assert.equal(location.get('location_level').get('id'), LOCATION_LEVEL_DEFAULTS.idOne);
    assert.ok(location_level_one.get('isNotDirty'));
    assert.ok(location_level_two.get('isNotDirty'));
    this.$('.t-location-level').val(LOCATION_LEVEL_DEFAULTS.idTwo).trigger('change');
    assert.equal(location_level_two.get('locations.length'), 2);
    assert.deepEqual(location_level_two.get('locations'), [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]);
    assert.equal(location_level_one.get('locations.length'), 0);
    assert.deepEqual(location_level_one.get('locations'), []);
    assert.deepEqual(location.get('location_level').get('locations')[1], LOCATION_DEFAULTS.idOne);
    assert.deepEqual(location.get('location_level').get('id'), LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.ok(location_level_one.get('isNotDirty'));
    assert.ok(location_level_two.get('isNotDirty'));
});

