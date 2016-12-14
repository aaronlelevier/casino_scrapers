import Ember from 'ember';
const { run, set } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';

const PD = PERSON_DEFAULTS.defaults();
const PC = PERSON_CURRENT.defaults();

moduleForComponent('dashboard-add-new', 'Integration | Component | dropdown modal', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry);
    run(() => {
      this.person_current = this.store.push('person-current', {id: PD.idOne, permissions: PC.permissions});
    });
  },
  afterEach() {
    delete this.store;
    delete this.person_current;
  }
});

test('it renders with top and left attributes', function(assert) {
  this.top = '50px';
  this.left = '150px';
  this.isOpen = true;
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{dashboard-add-new 
    isOpen=isOpen 
    top=top 
    left=left
    permissions=permissions
  }}`);
  assert.equal(this.$('.dashboard-add-new').attr('style'), 'left: 150px;top: 50px;');
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('ticket.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('admin.person.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('admin.role.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('admin.location.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('admin.locationlevel.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('admin.category.one'));
  assert.ok(this.$().text().trim().replace(/[\s\n]/gm).includes('tenant.one'));
});

test('it cancels closeTask, keepMeOpen when mouseLeave or mouseEnter', function(assert) {
  assert.expect(3);
  this.isOpen = true;
  this.closeTask = {
    cancelAll: function() {
      assert.ok(true);
    },
    perform: function() {
      assert.ok(true);
    }
  };
  this.keepMeOpen = function() {
    assert.ok(true);
  };
  this.render(hbs`{{dashboard-add-new 
    isOpen=isOpen 
    closeTask=closeTask 
    keepMeOpen=keepMeOpen
  }}`);
  const target = this.$('.dashboard-add-new')[0];
  const mouseEnter = new window.Event('mouseover', { bubbles: true, cancelable: true, view: window });
  run(() => target.dispatchEvent(mouseEnter));
  const mouseLeave = new window.Event('mouseout', { bubbles: true, cancelable: true, view: window });
  run(() => target.dispatchEvent(mouseLeave));
});

test('it doesnt show ticket link if add_ticket is false', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['add_ticket'] });
  });
  this.isOpen = true;
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{dashboard-add-new 
    isOpen=isOpen
    permissions=permissions
  }}`);
  assert.equal(this.$('[data-test-id="new-ticket"]').length, 1);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('[data-test-id="new-ticket"]').length, 0);
});

test('doesnt show person link if add_person is false', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['add_person'] });
  });
  this.isOpen = true;
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{dashboard-add-new 
    isOpen=isOpen
    permissions=permissions
  }}`);
  assert.equal(this.$('[data-test-id="new-person"]').length, 1);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('[data-test-id="new-person"]').length, 0);
});

test('it doesnt show role link if add_role is false', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['add_role'] });
  });
  this.isOpen = true;
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{dashboard-add-new 
    isOpen=isOpen
    permissions=permissions
  }}`);
  assert.equal(this.$('[data-test-id="new-role"]').length, 1);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('[data-test-id="new-role"]').length, 0);
});

test('it doesnt show location link if add_location is false', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['add_location'] });
  });
  this.isOpen = true;
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{dashboard-add-new 
    isOpen=isOpen
    permissions=permissions
  }}`);
  assert.equal(this.$('[data-test-id="new-location"]').length, 1);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('[data-test-id="new-location"]').length, 0);
});

test('it doesnt show location-level link if add_locationlevel is false', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['add_locationlevel'] });
  });
  this.isOpen = true;
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{dashboard-add-new 
    isOpen=isOpen
    permissions=permissions
  }}`);
  assert.equal(this.$('[data-test-id="new-location-level"]').length, 1);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('[data-test-id="new-location-level"]').length, 0);
});

test('it doesnt show category link if add_category is false', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['add_category'] });
  });
  this.isOpen = true;
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{dashboard-add-new 
    isOpen=isOpen
    permissions=permissions
  }}`);
  assert.equal(this.$('[data-test-id="new-category"]').length, 1);
  run(() => {
    set(this, 'permissions', []);
  });
  assert.equal(this.$('[data-test-id="new-category"]').length, 0);
});
