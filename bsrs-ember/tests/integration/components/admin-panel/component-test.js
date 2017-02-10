import Ember from 'ember';
const { run, set } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';

const PD = PERSON_DEFAULTS.defaults();
const PC = PERSON_CURRENT.defaults();

moduleForComponent('admin-panel', 'Integration | Component | admin panel', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry, ['model:person-current']);
    run(() => {
      this.person_current = this.store.push('person-current', {id: PD.idOne, permissions: PC.permissions});
    });
  },
  afterEach() {
    delete this.store;
    delete this.person_current;
  }
});

test('role && person link not shown if view_role && view_person is not in permissions', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_role', 'view_person'] });
  });
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{admin-panel permissions=permissions}}`);
  assert.equal(this.$('[data-test-id="admin-panel-person-header"]').length, 1);
  assert.equal(this.$('.t-nav-admin-role').length, 1);
  assert.equal(this.$('.t-nav-admin-people').length, 1);
  run(() => {
    set(this, 'permissions', ['view_person']);
  });
  assert.equal(this.$('[data-test-id="admin-panel-person-header"]').length, 1);
  assert.equal(this.$('.t-nav-admin-role').length, 0);
  assert.equal(this.$('.t-nav-admin-people').length, 1);
  run(() => {
    set(this, 'permissions', ['view_role']);
  });
  assert.equal(this.$('[data-test-id="admin-panel-person-header"]').length, 1);
  assert.equal(this.$('.t-nav-admin-role').length, 1);
  assert.equal(this.$('.t-nav-admin-people').length, 0);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('[data-test-id="admin-panel-person-header"]').length, 0);
  assert.equal(this.$('.t-nav-admin-role').length, 0);
  assert.equal(this.$('.t-nav-admin-people').length, 0);
});

test('location && llevel link not shown if view_location && view_locationlevel is not in permissions', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_location', 'view_locationlevel'] });
  });
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{admin-panel permissions=permissions}}`);
  assert.equal(this.$('.t-nav-admin-location').length, 1);
  assert.equal(this.$('.t-nav-admin-location-level').length, 1);
  assert.equal(this.$('[data-test-id="admin-panel-location-header"]').length, 1);
  run(() => {
    set(this, 'permissions', ['view_locationlevel']);
  });
  assert.equal(this.$('[data-test-id="admin-panel-location-header"]').length, 1);
  assert.equal(this.$('.t-nav-admin-location').length, 0);
  assert.equal(this.$('.t-nav-admin-location-level').length, 1);
  run(() => {
    set(this, 'permissions', ['view_location']);
  });
  assert.equal(this.$('[data-test-id="admin-panel-location-header"]').length, 1);
  assert.equal(this.$('.t-nav-admin-location').length, 1);
  assert.equal(this.$('.t-nav-admin-location-level').length, 0);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('[data-test-id="admin-panel-location-header"]').length, 0);
  assert.equal(this.$('.t-nav-admin-location').length, 0);
  assert.equal(this.$('.t-nav-admin-location-level').length, 0);
});

test('category link not shown if view_category is false', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_category'] });
  });
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{admin-panel permissions=permissions}}`);
  assert.equal(this.$('[data-test-id="admin-panel-category-header"]').length, 1);
  assert.equal(this.$('.t-nav-admin-category').length, 1);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('.t-nav-admin-category').length, 0);
  assert.equal(this.$('[data-test-id="admin-panel-category-header"]').length, 0);
});

test('provider link not shown if view_provider is false', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_provider'] });
  });
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{admin-panel permissions=permissions}}`);
  // TODO this assertion will fail when the link is added to the admin panel
  assert.equal(this.$('[data-test-id="admin-panel-provider-header"]').length, 0);
  assert.equal(this.$('.t-nav-admin-all-provider').length, 0);
  assert.equal(this.$('.t-nav-admin-private-network').length, 0);
  assert.equal(this.$('.t-nav-admin-preferred-provider').length, 0);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('[data-test-id="admin-panel-provider-header"]').length, 0);
  assert.equal(this.$('.t-nav-admin-all-provider').length, 0);
  assert.equal(this.$('.t-nav-admin-private-network').length, 0);
  assert.equal(this.$('.t-nav-admin-preferred-provider').length, 0);
});
