import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

const PD = PERSON_DEFAULTS.defaults();

moduleForComponent('tray-main', 'Integration | Component | tray-main', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry);
  },
  afterEach() {
    delete this.store;
  }
});

test('admin icon should hide if person does not have any admin view permissions', function(assert) {
  let person_current;
  run(() => {
    person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_ticket'] });
  });
  this.permissions = person_current.get('permissions');
  this.render(hbs`{{tray-main permissions=permissions}}`);
  assert.equal(this.$('.t-nav-admin').length, 0);
});

test('admin icon should show if person has any admin view permissions', function(assert) {
  let person_current;
  run(() => {
    person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_role', 'view_person'] });
  });
  this.permissions = person_current.get('permissions');
  this.render(hbs`{{tray-main permissions=permissions}}`);
  assert.equal(this.$('.t-nav-admin').length, 1);
});
