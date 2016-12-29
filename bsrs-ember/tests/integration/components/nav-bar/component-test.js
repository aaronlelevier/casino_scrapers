import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

const PD = PERSON_DEFAULTS.defaults();

moduleForComponent('nav-bar', 'Integration | Component | nav-bar', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry);
  },
  afterEach() {
    delete this.store;
  }
});

test('ticket link should hide if person does not have any ticket view permissions', function(assert) {
  let person_current;
  run(() => {
    person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_person'] });
  });
  this.permissions = person_current.get('permissions');
  this.render(hbs`{{nav-bar permissions=permissions}}`);
  assert.equal(this.$('.t-nav-tickets').length, 0);
});

test('ticket link should show if person has ticket view permissions', function(assert) {
  let person_current;
  run(() => {
    person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_ticket'] });
  });
  this.permissions = person_current.get('permissions');
  this.render(hbs`{{nav-bar permissions=permissions}}`);
  assert.equal(this.$('.t-nav-tickets').length, 1);
});
