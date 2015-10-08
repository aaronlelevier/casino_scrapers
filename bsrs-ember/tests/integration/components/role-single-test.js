import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

let store;

moduleForComponent('role-single', 'integration: role-single test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:role', 'model:location-level']);
        translation.initialize(this);
    }
});

test('selecting a location level will append the role id to the new location level but remove it from the previous location level', function(assert) {
    let location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.unusedId]});
    let location_level_one = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, roles: [ROLE_DEFAULTS.idOne]});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let all_location_levels = store.find('location-level');
    this.set('model', role);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{role-single model=model all_location_levels=all_location_levels}}`);
    let $component = this.$('.t-location-level');
    assert.equal(this.$('.t-location-level option:eq(0)').text(), 'Select One');
    assert.equal(this.$('.t-location-level option:eq(1)').text(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.equal(this.$('.t-location-level option:eq(2)').text(), LOCATION_LEVEL_DEFAULTS.nameDistrict);
    assert.deepEqual(role.get('location_level').get('roles'), [ROLE_DEFAULTS.idOne]);
    assert.equal(role.get('location_level').get('id'), LOCATION_LEVEL_DEFAULTS.idOne);
    assert.ok(location_level_one.get('isNotDirty'));
    assert.ok(location_level_two.get('isNotDirty'));
    this.$('.t-location-level').val(LOCATION_LEVEL_DEFAULTS.idTwo).trigger('change');
    assert.equal(location_level_two.get('roles.length'), 2);
    assert.deepEqual(location_level_two.get('roles'), [ROLE_DEFAULTS.unusedId, ROLE_DEFAULTS.idOne]);
    assert.equal(location_level_one.get('roles.length'), 0);
    assert.deepEqual(location_level_one.get('roles'), []);
    assert.deepEqual(role.get('location_level').get('roles')[1], ROLE_DEFAULTS.idOne);
    assert.deepEqual(role.get('location_level').get('id'), LOCATION_LEVEL_DEFAULTS.idTwo);
    assert.ok(location_level_one.get('isNotDirty'));
    assert.ok(location_level_two.get('isNotDirty'));
});

test('selecting a placeholder instead of legit location level will not append the roles id to anything but still remove it from the previous location level role', function(assert) {
    let location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameCompany, roles: [ROLE_DEFAULTS.unusedId]});
    let location_level_one = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, roles: [ROLE_DEFAULTS.idOne]});
    let role = store.push('role', {id: ROLE_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    let all_location_levels = store.find('location-level');
    this.set('model', role);
    this.set('all_location_levels', all_location_levels);
    this.render(hbs`{{role-single model=model all_location_levels=all_location_levels}}`);
    let $component = this.$('.t-location-level');
    assert.equal(this.$('.t-location-level option:eq(0)').text(), 'Select One');
    assert.equal(this.$('.t-location-level option:eq(1)').text(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.equal(this.$('.t-location-level option:eq(2)').text(), LOCATION_LEVEL_DEFAULTS.nameDistrict);
    assert.deepEqual(role.get('location_level').get('roles'), [ROLE_DEFAULTS.idOne]);
    assert.equal(role.get('location_level').get('id'), LOCATION_LEVEL_DEFAULTS.idOne);
    assert.ok(role.get('isNotDirty'));
    assert.ok(role.get('isNotDirtyOrRelatedNotDirty'));
    this.$('.t-location-level').val('Select One').trigger('change');
    assert.equal(location_level_two.get('roles.length'), 1);
    assert.deepEqual(location_level_two.get('roles'), [ROLE_DEFAULTS.unusedId]);
    assert.deepEqual(location_level_one.get('roles'), []);
    assert.equal(role.get('location_level'), undefined);
    assert.ok(location_level_one.get('isNotDirty'));
    assert.ok(location_level_two.get('isNotDirty'));
    assert.ok(role.get('isDirtyOrRelatedDirty'));
    assert.ok(role.get('isNotDirty'));
});
