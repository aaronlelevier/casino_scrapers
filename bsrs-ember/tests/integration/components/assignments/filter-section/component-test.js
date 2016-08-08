import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { clickTrigger, nativeMouseUp } from '../../../../helpers/ember-power-select'
import repository from 'bsrs-ember/tests/helpers/repository';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import AJFD from 'bsrs-ember/vendor/defaults/assignment-join-pfilter';
import page from 'bsrs-ember/tests/pages/assignment';

var store, trans, assignment;

moduleForComponent('assignments/filter-section', 'Integration | Component | assignments/detail section', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:assignment', 'model:assignment-join-pfilter', 'model:pfilter']);
    // translation.initialize(this);
    // trans = this.container.lookup('service:i18n');
    run(() => {
      assignment = store.push('assignment', {id: AD.idOne, description: AD.descOne, assignment_pf_fks: [AJFD.idOne]});
      store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idOne});
      store.push('pfilter', {id: PFD.idOne, key: PFD.keyOne});
    });
    assignment_repo = repository.initialize(this.container, this.registry, 'assignment');
    assignment_repo.getFilters = () => new Ember.RSVP.Promise((resolve) => {
      resolve({'results': [{id: PFD.autoAssignId, key: PFD.autoAssignKey, field: 'auto_assign'}, {id: PFD.idOne, key: PFD.keyOne}, {id: PFD.idTwo, key: PFD.keyTwo}]});
    });
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('add new pfilter, disables btn, and assignment is not dirty until select pfilter which displays component', function(assert) {
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  // existing pfilter
  assert.equal(this.$('.t-ticket-priority-select').length, 1);
  assert.equal(this.$('.ember-power-select-selected-item').text().trim(), PFD.keyOne);
  assert.equal(this.$('.t-assignment-pf-select').length, 1);
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
  page.addFilter();
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
  // adds pfilter but not dirty
  assert.equal(this.$('.ember-power-select-selected-item:eq(0)').text().trim(), PFD.keyOne);
  assert.equal(this.$('.t-assignment-pf-select').length, 2);
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(assignment.get('pf').get('length'), 1);
  // assignment is now dirty
  clickTrigger('.t-assignment-pf-select:eq(1)');
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
  // options do not include existing filters on model nor auto_assign
  assert.equal(this.$('li.ember-power-select-option').length, 1);
  nativeMouseUp(`.ember-power-select-option:contains(${PFD.keyTwo})`);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
  assert.equal(this.$('.ember-power-select-selected-item:eq(0)').text().trim(), PFD.keyOne);
  assert.equal(this.$('.ember-power-select-selected-item:eq(1)').text().trim(), PFD.keyTwo);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assert.equal(this.$('.t-assignment-pf-select').length, 2);
});

test('delete pfilter and assignment is dirty and can add and remove filter sequentially as well', function(assert) {
  assignment.add_pf({id: PFD.idTwo, key: PFD.keyTwo});
  assignment.saveRelated();
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(this.$('.ember-power-select-selected-item:eq(0)').text().trim(), PFD.keyOne);
  assert.equal(this.$('.ember-power-select-selected-item:eq(1)').text().trim(), PFD.keyTwo);
  assert.equal(this.$('.t-assignment-pf-select').length, 2);
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(assignment.get('pf').get('length'), 2);
  assert.ok(this.$('.t-del-pf-btn'));
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
  page.deleteFilter();
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
  assert.equal(this.$('.t-assignment-pf-select').length, 1);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assert.equal(assignment.get('pf').get('length'), 1);
  page.deleteFilter();
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
  assert.equal(this.$('.t-assignment-pf-select').length, 0);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assert.equal(assignment.get('pf').get('length'), 0);
  page.addFilter();
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
  page.deleteFilter();
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
})

test('if first filter selected is auto assign, disable btn', function(assert) {
  run(() => {
    store.clear();
    assignment = store.push('assignment', {id: AD.idOne, description: AD.descOne, assignment_pf_fks: [AJFD.idOne]});
    store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.autoAssignId});
    store.push('pfilter', {id: PFD.autoAssignId, key: PFD.autoAssignKey, field: PFD.autoAssignField});
  });
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
});

test('if assignment has dynamic pfilter, power select component will filter out response result', function(assert) {
  run(() => {
    store.clear();
    assignment = store.push('assignment', {id: AD.idOne, description: AD.descOne, assignment_pf_fks: [AJFD.idOne]});
    store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idTwo});
    store.push('pfilter', {id: PFD.idTwo, key: PFD.keyTwo, field: PFD.locationField, lookups: PFD.lookupsDynamic});
  });
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(assignment.get('pf').get('length'), 1);
});
