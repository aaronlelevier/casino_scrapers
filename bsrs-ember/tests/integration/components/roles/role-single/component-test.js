import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import RD from 'bsrs-ember/vendor/defaults/role';

let trans, store; 

moduleForComponent('roles/role-single', 'Integration | Component | roles/role-single', {
  integration: true,
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:role', 'model:currency']);
    let factory = this.container.lookupFactory('model:role');
    trans = this.container.lookup('service:i18n');
    run(() => {
      this.set('model', store.push('role', Object.assign(factory.getDefaults(RD.idOne), {
        dashboard_text: RD.dashboard_text,
        auth_amount: RD.auth_amount,
        auth_currency: RD.auth_currency
      })));
    });
  }
});

test('it renders with defaults checked or unchecked', function(assert) {
  this.render(hbs`{{roles/role-single model=model}}`);
  //labels
  assert.equal(this.$('[data-test-id="t-permission-view-ticket"]').text().trim(), 'role.label.permission.ticket');
  assert.equal(this.$('[data-test-id="t-permission-view-person"]').text().trim(), 'role.label.permission.person');
  assert.equal(this.$('[data-test-id="t-permission-view-role"]').text().trim(), 'role.label.permission.role');
  assert.equal(this.$('[data-test-id="t-permission-view-location"]').text().trim(), 'role.label.permission.location');
  assert.equal(this.$('[data-test-id="t-permission-view-locationlevel"]').text().trim(), 'role.label.permission.locationlevel');
  assert.equal(this.$('[data-test-id="t-permission-view-category"]').text().trim(), 'role.label.permission.category');
  assert.equal(this.$('[data-test-id="t-permission-view-create"]').text().trim(), 'role.label.permission.create');
  assert.equal(this.$('[data-test-id="t-permission-view-view"]').text().trim(), 'role.label.permission.view');
  assert.equal(this.$('[data-test-id="t-permission-view-edit"]').text().trim(), 'role.label.permission.edit');
  assert.equal(this.$('[data-test-id="t-permission-view-delete"]').text().trim(), 'role.label.permission.delete');

  // ticket
  assert.equal(this.$('[data-test-id="permission-view-ticket"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-ticket"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-ticket"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-ticket"] > input').is(':checked'), false);
});

test('check dirty tracking', function(assert) {
  this.render(hbs`{{roles/role-single model=model}}`);

  // category
  assert.equal(this.$('[data-test-id="permission-view-category"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-add-category"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-change-category"] > input').is(':checked'), true);
  assert.equal(this.$('[data-test-id="permission-delete-category"] > input').is(':checked'), false);

  // view
  $('[data-test-id="permission-view-category"]').click();
  assert.equal(this.$('[data-test-id="permission-view-category"] > input').is(':checked'), false);
  assert.ok(this.get('model').get('isDirty'));
  $('[data-test-id="permission-view-category"]').click();
  assert.equal(this.$('[data-test-id="permission-view-category"] > input').is(':checked'), true);
  assert.ok(this.get('model').get('isNotDirty'));
});
