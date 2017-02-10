import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import RD from 'bsrs-ember/vendor/defaults/role';

let role, store;

moduleForComponent('roles/permissions-section', 'Integration | Component | roles/permissions section', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:role']);
    let factory = this.container.lookupFactory('model:role');
    run(() => {
      role = this.set('model', store.push('role', factory.getDefaults(RD.idOne)));
    });
  }
});

test('it renders with defaults checked or unchecked', function(assert) {
  this.model = role;
  this.render(hbs`{{roles/permissions-section model=model}}`);
  //labels
  assert.equal(this.$('[data-test-id="t-permission-view-ticket"]').text().trim(), 'role.label.permission.ticket');
  assert.equal(this.$('[data-test-id="t-permission-view-person"]').text().trim(), 'role.label.permission.person');
  assert.equal(this.$('[data-test-id="t-permission-view-role"]').text().trim(), 'role.label.permission.role');
  assert.equal(this.$('[data-test-id="t-permission-view-location"]').text().trim(), 'role.label.permission.location');
  assert.equal(this.$('[data-test-id="t-permission-view-locationlevel"]').text().trim(), 'role.label.permission.locationlevel');
  assert.equal(this.$('[data-test-id="t-permission-view-category"]').text().trim(), 'role.label.permission.category');
  assert.equal(this.$('[data-test-id="t-permission-view-workorder"]').text().trim(), 'role.label.permission.workorder');
  assert.equal(this.$('[data-test-id="t-permission-view-provider"]').text().trim(), 'role.label.permission.provider');
  assert.equal(this.$('[data-test-id="t-permission-view-create"]').text().trim(), 'role.label.permission.create');
  assert.equal(this.$('[data-test-id="t-permission-view-view"]').text().trim(), 'role.label.permission.view');
  assert.equal(this.$('[data-test-id="t-permission-view-edit"]').text().trim(), 'role.label.permission.edit');
  assert.equal(this.$('[data-test-id="t-permission-view-delete"]').text().trim(), 'role.label.permission.delete');

  // ticket
  assert.equal(this.$('[data-test-id="permission-view-ticket"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-ticket"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-ticket"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-ticket"] > input').is(':checked'), false);

  // person
  assert.equal(this.$('[data-test-id="permission-view-person"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-person"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-person"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-person"] > input').is(':checked'), false);

  // role
  assert.equal(this.$('[data-test-id="permission-view-role"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-role"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-role"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-role"] > input').is(':checked'), false);

  // location
  assert.equal(this.$('[data-test-id="permission-view-location"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-location"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-location"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-location"] > input').is(':checked'), false);

  // locationlevel
  assert.equal(this.$('[data-test-id="permission-view-locationlevel"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-locationlevel"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-locationlevel"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-locationlevel"] > input').is(':checked'), false);

  // category
  assert.equal(this.$('[data-test-id="permission-view-category"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-category"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-category"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-category"] > input').is(':checked'), false);

  // workorder
  assert.equal(this.$('[data-test-id="permission-view-workorder"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-workorder"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-workorder"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-workorder"] > input').is(':checked'), false);

  // provider
  assert.equal(this.$('[data-test-id="permission-view-provider"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-provider"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-provider"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-provider"] > input').is(':checked'), false);
});

test('permissions should render in the correct order and labels should match their underlying checkboxes', function(assert) {
  this.model = role;
  this.render(hbs`{{roles/permissions-section model=model}}`);
  //labels

  assert.equal(this.$('[data-test-id="t-permission-view-header"]').length, 1);
  assert.equal(this.$('[data-test-id="t-permission-view-header"] [data-test-id*="t-permission-view"]').length, 4);
  assert.equal(this.$('[data-test-id="t-permission-view-header"] div:nth-child(2)').text().trim(), 'role.label.permission.view');
  assert.equal(this.$('[data-test-id="t-permission-view-header"] div:nth-child(3)').text().trim(), 'role.label.permission.create');
  assert.equal(this.$('[data-test-id="t-permission-view-header"] div:nth-child(4)').text().trim(), 'role.label.permission.edit');
  assert.equal(this.$('[data-test-id="t-permission-view-header"] div:nth-child(5)').text().trim(), 'role.label.permission.delete');

  assert.equal(this.$('[data-test-id="t-permission-view-row"]').length, 8);
  assert.equal(this.$('[data-test-id="t-permission-view-row"]:eq(0) div:nth-child(2) label')[0].getAttribute('data-test-id'), 'permission-view-ticket');
  assert.equal(this.$('[data-test-id="t-permission-view-row"]:eq(0) div:nth-child(3) label')[0].getAttribute('data-test-id'), 'permission-add-ticket');
  assert.equal(this.$('[data-test-id="t-permission-view-row"]:eq(0) div:nth-child(4) label')[0].getAttribute('data-test-id'), 'permission-change-ticket');
  assert.equal(this.$('[data-test-id="t-permission-view-row"]:eq(0) div:nth-child(5) label')[0].getAttribute('data-test-id'), 'permission-delete-ticket');

});

test('check dirty tracking', function(assert) {
  this.model = role;
  this.render(hbs`{{roles/permissions-section model=model}}`);

  // category
  assert.equal(this.$('[data-test-id="permission-view-category"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-category"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-category"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-category"] > input').is(':checked'), false);

  // view
  $('[data-test-id="permission-view-category"]').click();
  assert.equal(this.$('[data-test-id="permission-view-category"] > input').is(':checked'), false);
  assert.ok(role.get('isDirty'));
  $('[data-test-id="permission-view-category"]').click();
  assert.equal(this.$('[data-test-id="permission-view-category"] > input').is(':checked'), true);
  assert.ok(role.get('isNotDirty'));

  // add
  $('[data-test-id="permission-add-category"]').click();
  assert.equal(this.$('[data-test-id="permission-add-category"] > input').is(':checked'), false);
  assert.ok(role.get('isDirty'));
  $('[data-test-id="permission-add-category"]').click();
  assert.equal(this.$('[data-test-id="permission-add-category"] > input').is(':checked'), true);
  assert.ok(role.get('isNotDirty'));

  // change
  $('[data-test-id="permission-change-category"]').click();
  assert.equal(this.$('[data-test-id="permission-change-category"] > input').is(':checked'), false);
  assert.ok(role.get('isDirty'));
  $('[data-test-id="permission-change-category"]').click();
  assert.equal(this.$('[data-test-id="permission-change-category"] > input').is(':checked'), true);
  assert.ok(role.get('isNotDirty'));

  // delete
  $('[data-test-id="permission-delete-category"]').click();
  assert.equal(this.$('[data-test-id="permission-delete-category"] > input').is(':checked'), true);
  assert.ok(role.get('isDirty'));
  $('[data-test-id="permission-delete-category"]').click();
  assert.equal(this.$('[data-test-id="permission-delete-category"] > input').is(':checked'), false);
  assert.ok(role.get('isNotDirty'));
});

test('check provider dirty tracking', function(assert) {
  this.model = role;
  this.render(hbs`{{roles/permissions-section model=model}}`);

  // provider
  assert.equal(this.$('[data-test-id="permission-view-provider"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-provider"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-provider"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-provider"] > input').is(':checked'), false);

  // view
  $('[data-test-id="permission-view-provider"]').click();
  assert.equal(this.$('[data-test-id="permission-view-provider"] > input').is(':checked'), false);
  assert.ok(role.get('isDirty'));
  $('[data-test-id="permission-view-provider"]').click();
  assert.equal(this.$('[data-test-id="permission-view-provider"] > input').is(':checked'), true);
  assert.ok(role.get('isNotDirty'));

  // add
  $('[data-test-id="permission-add-provider"]').click();
  assert.equal(this.$('[data-test-id="permission-add-provider"] > input').is(':checked'), false);
  assert.ok(role.get('isDirty'));
  $('[data-test-id="permission-add-provider"]').click();
  assert.equal(this.$('[data-test-id="permission-add-provider"] > input').is(':checked'), true);
  assert.ok(role.get('isNotDirty'));

  // change
  $('[data-test-id="permission-change-provider"]').click();
  assert.equal(this.$('[data-test-id="permission-change-provider"] > input').is(':checked'), false);
  assert.ok(role.get('isDirty'));
  $('[data-test-id="permission-change-provider"]').click();
  assert.equal(this.$('[data-test-id="permission-change-provider"] > input').is(':checked'), true);
  assert.ok(role.get('isNotDirty'));

  // delete
  $('[data-test-id="permission-delete-provider"]').click();
  assert.equal(this.$('[data-test-id="permission-delete-provider"] > input').is(':checked'), true);
  assert.ok(role.get('isDirty'));
  $('[data-test-id="permission-delete-provider"]').click();
  assert.equal(this.$('[data-test-id="permission-delete-provider"] > input').is(':checked'), false);
  assert.ok(role.get('isNotDirty'));
});
