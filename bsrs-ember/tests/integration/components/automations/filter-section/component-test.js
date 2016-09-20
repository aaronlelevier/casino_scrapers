import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { clickTrigger, nativeMouseUp } from '../../../../helpers/ember-power-select';
import repository from 'bsrs-ember/tests/helpers/repository';
import page from 'bsrs-ember/tests/pages/automation';
import AD from 'bsrs-ember/vendor/defaults/automation';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import AJFD from 'bsrs-ember/vendor/defaults/automation-join-pfilter';
import CD from 'bsrs-ember/vendor/defaults/criteria';
import PJFD from 'bsrs-ember/vendor/defaults/pfilter-join-criteria';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, trans, automation, results, automation_repo;

moduleForComponent('automations/filter-section', 'Integration | Component | automations/filter-section', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:automation', 'model:automation-join-pfilter', 'model:pfilter']);

    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);

    run(() => {
      automation = store.push('automation', {id: AD.idOne, description: AD.descriptionOne, automation_pf_fks: [AJFD.idOne]});
      store.push('automation-join-pfilter', {id: AJFD.idOne, automation_pk: AD.idOne, pfilter_pk: PFD.idOne});
      store.push('pfilter', {id: PFD.idOne, source_id: PFD.sourceIdOne, key: PFD.keyOne, field: PFD.fieldOne, criteria: PFD.criteriaOne, lookups: {}});
      // ticket-priorities
      store.push('ticket-priority', {id: TD.priorityOneId, name: TD.priorityOne});
    });
    automation_repo = repository.initialize(this.container, this.registry, 'automation');
    results = [{id: PFD.sourceIdOne, key: PFD.keyOne, field: PFD.fieldOne, lookups: {}},
                     {id: PFD.sourceIdTwo, key: PFD.keyTwo, field: PFD.locationField, lookups: PFD.lookupsDynamic},
                     {id: PFD.sourceIdThree, key: PFD.keyThree, field: PFD.locationField, lookups: PFD.lookupsDynamicTwo}];
    automation_repo.getFilters = () => new Ember.RSVP.Promise((resolve) => {
      resolve({'results': results});
    });
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('add pfilter - adds a filter with a random uuid and a source_id for the AvailableFilter [AF] selected', function(assert) {
  this.model = automation;
  this.render(hbs`{{automations/filter-section model=model}}`);
  assert.equal(this.$('.t-automation-pf-select').length, 1);
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(automation.get('pf').objectAt(0).get('id'), PFD.idOne);
  page.addFilter();
  assert.equal(this.$('.t-automation-pf-select').length, 2);
  // still a count of "1" b/c no AF has been selected
  assert.equal(automation.get('pf').get('length'), 2);
  clickTrigger('.t-automation-pf-select:eq(1)');
  nativeMouseUp(`.ember-power-select-option:contains(${PFD.keyTwo})`);
  assert.equal(automation.get('pf').get('length'), 2);
  assert.ok(automation.get('pf').objectAt(1).get('id'));
  assert.equal(automation.get('pf').objectAt(1).get('source_id'), PFD.sourceIdTwo);
  assert.equal(automation.get('pf').objectAt(1).get('field'), PFD.locationField);
  assert.equal(automation.get('pf').objectAt(1).get('lookups'), PFD.lookupsDynamic);
});

test('delete - removes automation.pf in the store', function(assert) {
  this.model = automation;
  this.render(hbs`{{automations/filter-section model=model}}`);
  assert.equal(this.$('.t-automation-pf-select').length, 1);
  assert.equal(automation.get('pf').get('length'), 1);
  page.deleteFilter();
  assert.equal(this.$('.t-automation-pf-select').length, 0);
  assert.equal(automation.get('pf').get('length'), 0);
});

test('add an empty filter then delete it', function(assert) {
  this.model = automation;
  this.render(hbs`{{automations/filter-section model=model}}`);
  assert.equal(this.$('.t-automation-pf-select').length, 1);
  page.addFilter();
  assert.equal(this.$('.t-automation-pf-select').length, 2);
  page.deleteFilter();
  assert.equal(this.$('.t-automation-pf-select').length, 1);
});

test('change pfilter from an existing to a different pfilter', function(assert) {
  run(() => {
    store.push('pfilter-join-criteria', {id: PJFD.idOne, pfilter_pk: PFD.idOne, criteria_pk: CD.idOne});
    store.push('pfilter', {id: PFD.idOne, pfilter_criteria_fks: [PJFD.idOne]});
    store.push('criteria', {id: CD.idOne});
  });
  this.model = automation;
  this.render(hbs`{{automations/filter-section model=model}}`);
  assert.equal(this.$('.t-automation-pf-select').length, 1);
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(automation.get('pf').objectAt(0).get('id'), PFD.idOne);
  assert.equal(automation.get('pf').objectAt(0).get('source_id'), PFD.sourceIdOne);
  assert.equal(this.$('.ember-power-select-multiple-option').length, 1);
  clickTrigger('.t-automation-pf-select:eq(0)');
  nativeMouseUp(`.ember-power-select-option:contains(${PFD.keyTwo})`);
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(automation.get('pf').objectAt(0).get('id'), PFD.idOne);
  assert.equal(automation.get('pf').objectAt(0).get('source_id'), PFD.sourceIdTwo);
  // no criteria because the AF type has changed
  assert.equal(this.$('.ember-power-select-multiple-option').length, 0);
});

test('add new pfilter, and automation is not dirty until select pfilter which displays component', function(assert) {
  this.model = automation;
  this.render(hbs`{{automations/filter-section model=model}}`);
  // existing pfilter
  assert.equal(this.$('.t-priority-criteria').length, 1);
  assert.equal(this.$('.ember-power-select-selected-item').text().trim(), trans.t(PFD.keyOne));
  assert.equal(this.$('.t-automation-pf-select').length, 1);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
  page.addFilter();
  // adds pfilter but not dirty
  assert.equal(this.$('.ember-power-select-selected-item:eq(0)').text().trim(), trans.t(PFD.keyOne));
  assert.equal(this.$('.t-automation-pf-select').length, 2);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('pf').get('length'), 2);
  // automation is now dirty
  clickTrigger('.t-automation-pf-select:eq(1)');
  assert.equal(this.$('.t-priority-criteria').length, 1);
  assert.equal(this.$('li.ember-power-select-option').length, 2);
  nativeMouseUp(`.ember-power-select-option:contains(${PFD.keyTwo})`);
  assert.equal(this.$('.t-add-pf-btn').prop('disabled'), false);
  assert.equal(this.$('.ember-power-select-selected-item:eq(0)').text().trim(), trans.t(PFD.keyOne));
  assert.equal(this.$('.ember-power-select-selected-item:eq(1)').text().trim(), trans.t(PFD.keyTwo));
  // now the automation is dirty b/c pfilter has an criteria
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  assert.equal(this.$('.t-automation-pf-select').length, 2);
  // // both power-selects render
  assert.equal(this.$('.t-priority-criteria').length, 1);
  assert.equal(this.$('.t-ticket-location-select').length, 1);
  assert.equal(this.$('.ember-power-select-trigger-multiple-input:eq(0)').get(0)['placeholder'], trans.t('admin.placeholder.location_filter_select'));
});

test('delete pfilter and automation is dirty and can add and remove filter sequentially as well', function(assert) {
  automation.add_pf({id: PFD.idTwo, key: PFD.keyTwo});
  automation.saveRelated();
  this.model = automation;
  this.render(hbs`{{automations/filter-section model=model}}`);
  assert.equal(this.$('.ember-power-select-selected-item:eq(0)').text().trim(), trans.t(PFD.keyOne));
  assert.equal(this.$('.ember-power-select-selected-item:eq(1)').text().trim(), trans.t(PFD.keyTwo));
  assert.equal(this.$('.t-automation-pf-select').length, 2);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('pf').get('length'), 2);
  assert.ok(this.$('.t-del-pf-btn'));
  page.deleteFilter();
  assert.equal(this.$('.t-automation-pf-select').length, 1);
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  assert.equal(automation.get('pf').get('length'), 1);
  page.deleteFilter();
  assert.equal(this.$('.t-automation-pf-select').length, 0);
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  assert.equal(automation.get('pf').get('length'), 0);
  page.addFilter();
  page.deleteFilter();
  assert.equal(this.$('.t-automation-pf-select').length, 0);
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  assert.equal(automation.get('pf').get('length'), 0);
});

test('if automation has dynamic pfilter, power-select component will filter out response result', function(assert) {
  run(() => {
    store.clear();
    automation = store.push('automation', {id: AD.idOne, description: AD.descriptionOne, automation_pf_fks: [AJFD.idOne]});
    store.push('automation-join-pfilter', {id: AJFD.idOne, automation_pk: AD.idOne, pfilter_pk: PFD.idTwo});
    store.push('pfilter', {id: PFD.idTwo, key: PFD.keyTwo, field: PFD.locationField, lookups: PFD.lookupsDynamic});
  });
  this.model = automation;
  this.render(hbs`{{automations/filter-section model=model}}`);
  assert.equal(automation.get('pf').get('length'), 1);
  clickTrigger('.t-automation-pf-select:eq(0)');
  assert.equal(this.$('li.ember-power-select-option').length, results.length - 1);
});

test('delete the middle filter, and it correctly leaves the remaining start n end filter in the page', function(assert) {
  run(() => {
    store.push('pfilter', {id: PFD.idTwo, key: PFD.keyTwo, field: PFD.locationField, criteria: PFD.criteriaTwo, lookups: {}});
    store.push('pfilter', {id: PFD.idThree, key: PFD.keyThree, field: PFD.locationField, criteria: PFD.criteriaThree, lookups: {}});
    automation.add_pf({id: PFD.idTwo});
    automation.add_pf({id: PFD.idThree});
  });
  this.model = automation;
  this.render(hbs`{{automations/filter-section model=model}}`);
  assert.equal(this.$('.t-automation-pf-select').length, 3);
  assert.equal(page.automationFilterOneText, trans.t(PFD.keyOne));
  assert.equal(page.automationFilterTwoText, trans.t(PFD.keyTwo));
  assert.equal(page.automationFilterThreeText, trans.t(PFD.keyThree));
  page.deleteFilterTwo();
  assert.equal(this.$('.t-automation-pf-select').length, 2);
  assert.equal(page.automationFilterOneText, trans.t(PFD.keyOne));
  assert.equal(page.automationFilterTwoText, trans.t(PFD.keyThree));
});

test('ticket-priority-select is not searchable', function(assert) {
  this.model = automation;
  this.render(hbs`{{automations/filter-section model=model}}`);
  assert.equal(this.$('.t-priority-criteria').length, 1);
  // would be '.ember-power-select-trigger-multiple-input' if it was searchEnabled
  assert.equal(this.$('.ember-power-select-multiple-trigger').length, 1);
});
