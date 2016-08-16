import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { clickTrigger, nativeMouseUp } from '../../../../helpers/ember-power-select';
import repository from 'bsrs-ember/tests/helpers/repository';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import AJFD from 'bsrs-ember/vendor/defaults/assignment-join-pfilter';
import page from 'bsrs-ember/tests/pages/assignment';

var store, trans, assignment;

moduleForComponent('assignments/filter-section', 'aaron Integration | Component | assignments/detail section', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:assignment', 'model:assignment-join-pfilter', 'model:pfilter']);
    // translation.initialize(this);
    // trans = this.container.lookup('service:i18n');
    run(() => {
      assignment = store.push('assignment', {id: AD.idOne, description: AD.descOne, assignment_pf_fks: [AJFD.idOne]});
      store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idOne});
      store.push('pfilter', {id: PFD.idOne, source_id: PFD.sourceIdOne, key: PFD.keyOne, field: PFD.fieldOne, criteria: PFD.criteriaOne, lookups: {}});
    });
    const assignment_repo = repository.initialize(this.container, this.registry, 'assignment');
    assignment_repo.getFilters = () => new Ember.RSVP.Promise((resolve) => {
      resolve({'results': [{id: PFD.sourceIdOne, key: PFD.keyOne, field: PFD.fieldOne, lookups: {}},
                           {id: PFD.sourceIdTwo, key: PFD.keyTwo, field: PFD.locationField, lookups: PFD.lookupsDynamic},
                           {id: PFD.sourceIdThree, key: PFD.keyThree, field: PFD.autoAssignField, lookups: {}}
        ]});
    });
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('add pfilter - adds a filter with a random uuid and a source_id for the AvailableFilter [AF] selected', function(assert) {
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(this.$('.t-assignment-pf-select').length, 1);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment.get('pf').objectAt(0).get('id'), PFD.idOne);
  page.addFilter();
  assert.equal(this.$('.t-assignment-pf-select').length, 2);
  // still a count of "1" b/c no AF has been selected
  assert.equal(assignment.get('pf').get('length'), 1);
  clickTrigger('.t-assignment-pf-select:eq(1)');
  nativeMouseUp(`.ember-power-select-option:contains(${PFD.keyTwo})`);
  assert.equal(assignment.get('pf').get('length'), 2);
  assert.equal(assignment.get('pf').objectAt(1).get('id'), UUID.value);
  assert.equal(assignment.get('pf').objectAt(1).get('source_id'), PFD.sourceIdTwo);
  assert.equal(assignment.get('pf').objectAt(1).get('field'), PFD.locationField);
  assert.equal(assignment.get('pf').objectAt(1).get('lookups'), PFD.lookupsDynamic);
});

test('delete - removes assignment.pf in the store', function(assert) {
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(this.$('.t-assignment-pf-select').length, 1);
  assert.equal(assignment.get('pf').get('length'), 1);
  page.deleteFilter();
  assert.equal(this.$('.t-assignment-pf-select').length, 1);
  assert.equal(assignment.get('pf').get('length'), 0);
});

test('add an empty filter then delete it', function(assert) {
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(this.$('.t-assignment-pf-select').length, 1);
  page.addFilter();
  assert.equal(this.$('.t-assignment-pf-select').length, 2);
  page.deleteFilter();
  assert.equal(this.$('.t-assignment-pf-select').length, 1);
});

test('change pfilter from an existing to a different pfilter', function(assert) {
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(this.$('.t-assignment-pf-select').length, 1);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment.get('pf').objectAt(0).get('id'), PFD.idOne);
  assert.equal(assignment.get('pf').objectAt(0).get('source_id'), PFD.sourceIdOne);
  clickTrigger('.t-assignment-pf-select:eq(0)');
  nativeMouseUp(`.ember-power-select-option:contains(${PFD.keyTwo})`);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment.get('pf').objectAt(0).get('id'), UUID.value);
  assert.equal(assignment.get('pf').objectAt(0).get('source_id'), PFD.sourceIdTwo);
});

test('add new pfilter, disables btn, and assignment is not dirty until select pfilter which displays component', function(assert) {
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  // existing pfilter
  assert.equal(this.$('.t-priority-criteria').length, 1);
  assert.equal(this.$('.ember-power-select-selected-item').text().trim(), PFD.keyOne);
  assert.equal(this.$('.t-assignment-pf-select').length, 1);
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
  page.addFilter();
  assert.equal(this.$('.ember-power-select-placeholder').text().trim(), 'admin.placeholder.available_filter');
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
  // adds pfilter but not dirty
  assert.equal(this.$('.ember-power-select-selected-item:eq(0)').text().trim(), PFD.keyOne);
  assert.equal(this.$('.t-assignment-pf-select').length, 2);
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(assignment.get('pf').get('length'), 1);
  // assignment is now dirty
  clickTrigger('.t-assignment-pf-select:eq(1)');
  assert.equal(this.$('.t-priority-criteria').length, 1);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
  // options do not include existing filters on model nor auto_assign
  assert.equal(this.$('li.ember-power-select-option').length, 2);
  nativeMouseUp(`.ember-power-select-option:contains(${PFD.keyTwo})`);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
  assert.equal(this.$('.ember-power-select-selected-item:eq(0)').text().trim(), PFD.keyOne);
  assert.equal(this.$('.ember-power-select-selected-item:eq(1)').text().trim(), PFD.keyTwo);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assert.equal(this.$('.t-assignment-pf-select').length, 2);
  // both power-selects render
  assert.equal(this.$('.t-priority-criteria').length, 1);
  assert.equal(this.$('.t-ticket-location-select').length, 1);
  assert.equal(this.$('.ember-power-select-trigger-multiple-input:eq(0)').get(0)['placeholder'], 'admin.placeholder.available_filter.location');
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
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
  assert.equal(this.$('.t-assignment-pf-select').length, 1);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assert.equal(assignment.get('pf').get('length'), 0);
  page.addFilter();
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
  page.deleteFilter();
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.equal(this.$('.t-assignment-pf-select').length, 1);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
});

test('if first filter selected is auto assign, disable btn', function(assert) {
  run(() => {
    store.clear();
    assignment = store.push('assignment', {id: AD.idOne, description: AD.descOne, assignment_pf_fks: [AJFD.idOne]});
    store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idThree});
    store.push('pfilter', {id: PFD.idThree, key: PFD.autoAssignKey, field: PFD.autoAssignField});
  });
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
});

test('if select auto_assign then disable add filter btn', function(assert) {
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
  clickTrigger('.t-assignment-pf-select:eq(0)');
  nativeMouseUp(`.ember-power-select-option:contains(${PFD.keyThree})`);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
  clickTrigger('.t-assignment-pf-select:eq(0)');
  nativeMouseUp(`.ember-power-select-option:contains(${PFD.keyTwo})`);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
});

test('if assignment has dynamic pfilter, power-select component will filter out response result', function(assert) {
  run(() => {
    store.clear();
    assignment = store.push('assignment', {id: AD.idOne, description: AD.descOne, assignment_pf_fks: [AJFD.idOne]});
    store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idTwo});
    store.push('pfilter', {id: PFD.idTwo, key: PFD.keyTwo, field: PFD.locationField, lookups: PFD.lookupsDynamic});
  });
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(assignment.get('pf').get('length'), 1);
  clickTrigger('.t-assignment-pf-select:eq(0)');
  assert.equal(this.$('li.ember-power-select-option').length, 2);
});

test('deactivate add-filter-btn test - for existing assignment', function(assert) {
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal($('.t-assignment-pf-select').length, 1);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
  page.deleteFilter();
  assert.equal($('.t-assignment-pf-select').length, 1);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
});

test('add-filter-btn is deactivated if no filter and clicking delete wont change nothin', function(assert) {
  run(() => {
    store.clear();
    assignment = store.push('assignment', {id: AD.idOne, description: AD.descOne});
  });
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.equal($('.t-assignment-pf-select').length, 1);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
  page.deleteFilter();
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
  page.deleteFilter();
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), true);
});

test('delete the middle filter, and it correctly leaves the remaining start n end filter in the page', function(assert) {
  run(() => {
    let pf2 = store.push('pfilter', {id: PFD.idTwo, key: PFD.keyTwo, field: PFD.locationField, criteria: PFD.criteriaTwo, lookups: {}});
    let pf3 = store.push('pfilter', {id: PFD.idThree, key: PFD.keyThree, field: PFD.locationField, criteria: PFD.criteriaThree, lookups: {}});
    assignment.add_pf({id: PFD.idTwo});
    assignment.add_pf({id: PFD.idThree});
  });
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(this.$('.t-assignment-pf-select').length, 3);
  assert.equal(page.assignmentFilterOneText, PFD.keyOne);
  assert.equal(page.assignmentFilterTwoText, PFD.keyTwo);
  assert.equal(page.assignmentFilterThreeText, PFD.keyThree);
  page.deleteFilterTwo();
  assert.equal(this.$('.t-assignment-pf-select').length, 2);
  assert.equal(page.assignmentFilterOneText, PFD.keyOne);
  assert.equal(page.assignmentFilterTwoText, PFD.keyThree);
});

test('ticket-priority-select is not searchable', function(assert) {
  this.model = assignment;
  this.render(hbs`{{assignments/filter-section model=model}}`);
  assert.equal(this.$('.t-priority-criteria').length, 1);
  // would be '.ember-power-select-trigger-multiple-input' if it was searchEnabled
  assert.equal(this.$('.ember-power-select-multiple-trigger').length, 1);});
