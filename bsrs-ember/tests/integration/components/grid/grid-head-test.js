import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PC from 'bsrs-ember/vendor/defaults/person-current';

const PD = PERSON_DEFAULTS.defaults();
const PERSON_CURRENT = PC.defaults();

moduleForComponent('grid/grid-head', 'Integration | Component | grid-head-desktop', {
  integration: true,
  beforeEach() {
    this.store = this.container.lookup('service:simpleStore');
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'desktop').begin + 5;
    flexi.set('width', width);
  },
  afterEach() {
    delete this.store;
  }
});

test('if no exportGrid, doesnt show exportGrid btn', function(assert) {
  this.exportGrid = false;
  this.render(hbs`{{grid/helpers/grid-head exportGrid=exportGrid}}`);
  assert.equal(this.$('[data-test-id=grid-export-btn]').length, 0);
  this.set('exportGrid', true);
  this.render(hbs`{{grid/helpers/grid-head exportGrid=exportGrid}}`);
  assert.equal(this.$('[data-test-id=grid-export-btn]').length, 1);
  assert.equal(this.$('[data-test-id=grid-export-btn] i').length, 1);
});

test('if can view create ticket, then button shows', function(assert) {
  let person_current;
  run(() => {
    person_current = this.store.push('person-current', {id: PD.idOne, permissions: PERSON_CURRENT.permissions});
  });
  this.noun = 'ticket';
  this.permissions = person_current.get('permissions');
  this.render(hbs`{{grid/helpers/grid-head permissions=permissions noun=noun}}`);
  assert.equal(this.$('.t-add-new').length, 1);
});

test('if can view create ticket, then button shows', function(assert) {
  let person_current;
  run(() => {
    const new_permissions = PERSON_CURRENT.permissions;
    var index = new_permissions.indexOf('add_ticket');
    new_permissions.splice(index, index+1);
    person_current = this.store.push('person-current', {id: PD.idOne, permissions: new_permissions});
  });
  this.noun = 'ticket';
  this.permissions = person_current.get('permissions');
  this.render(hbs`{{grid/helpers/grid-head permissions=permissions noun=noun}}`);
  assert.equal(this.$('.t-add-new').length, 0);
});
