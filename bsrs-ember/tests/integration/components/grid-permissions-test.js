import Ember from 'ember';
const { run, set } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import CD from 'bsrs-ember/vendor/defaults/category';
import AD from 'bsrs-ember/vendor/defaults/automation';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TND from 'bsrs-ember/vendor/defaults/tenant';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import RD from 'bsrs-ember/vendor/defaults/role';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';

const PD = PERSON_DEFAULTS.defaults();
const PC = PERSON_CURRENT.defaults();

moduleForComponent('grid-permissions', 'Integration: grid-permissions test', {
  integration: true,
  beforeEach() {
    this.store = module_registry(this.container, this.registry, ['model:person-current']);
    this.requested = Ember.ArrayProxy.extend({
      content: Ember.computed(function () {
        return Ember.A(this.get('source'));
      }).property()
    }).create({
      source: []
    });
  },
  afterEach() {
    delete this.store;
  }
});

test('it renders without a create btn if permissions dont include "add_ticket"', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_ticket'] });
    this.store.push('ticket', {id: TD.idOne});
  });
  this.model = this.store.find('ticket');
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{tickets/ticket-list
    model=model
    noun="ticket"
    permissions=permissions
    requested=requested
  }}`);
  assert.equal(this.$('.t-add-new').length, 0);
});

test('it renders without a create btn if permissions dont include "add_locationlevel"', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_locationlevel'] });
    this.store.push('location-level', {id: LLD.idOne});
  });
  this.model = this.store.find('location-level');
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{location-levels
    model=model
    noun="locationlevel"
    permissions=permissions
    requested=requested
  }}`);
  assert.equal(this.$('.t-add-new').length, 0);
});

test('it renders without a create btn if permissions dont include "add_location"', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_location'] });
    this.store.push('location', {id: LD.idOne});
  });
  this.model = this.store.find('location');
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{locations/location-list
    model=model
    noun="location"
    permissions=permissions
    requested=requested
  }}`);
  assert.equal(this.$('.t-add-new').length, 0);
});

test('it renders without a create btn if permissions dont include "add_role"', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_role'] });
    this.store.push('role', {id: RD.idOne});
  });
  this.model = this.store.find('role');
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{roles/role-list
    model=model
    noun="role"
    permissions=permissions
    requested=requested
  }}`);
  assert.equal(this.$('.t-add-new').length, 0);
});

test('it renders without a create btn if permissions dont include "add_people"', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_person'] });
    this.store.push('person', {id: PD.idOne});
  });
  this.model = this.store.find('person');
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{people/person-list
    model=model
    noun="person"
    permissions=permissions
    requested=requested
  }}`);
  assert.equal(this.$('.t-add-new').length, 0);
});

test('it renders without a create btn if permissions dont include "add_category"', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_category'] });
    this.store.push('category', {id: CD.idOne});
  });
  this.model = this.store.find('category');
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{categories/category-list
    model=model
    noun="category"
    permissions=permissions
    requested=requested
  }}`);
  assert.equal(this.$('.t-add-new').length, 0);
});

test('it renders without a create btn if permissions dont include "add_tenant"', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_tenant'] });
    this.store.push('tenant', {id: TND.idOne});
  });
  this.model = this.store.find('tenant');
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{tenants/tenant-list
    model=model
    noun="tenant"
    permissions=permissions
    requested=requested
  }}`);
  assert.equal(this.$('.t-add-new').length, 1);
});

test('it renders without a create btn if permissions dont include "add_automation"', function(assert) {
  run(() => {
    this.person_current = this.store.push('person-current', { id: PD.idOne, permissions: ['view_automation'] });
    this.store.push('automation', {id: AD.idOne});
  });
  this.model = this.store.find('automation');
  this.permissions = this.person_current.get('permissions');
  this.render(hbs`{{automations/automation-list
    model=model
    noun="automation"
    permissions=permissions
    requested=requested
  }}`);
  assert.equal(this.$('.t-add-new').length, 1);
});
