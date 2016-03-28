import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import clickTrigger from 'bsrs-ember/tests/helpers/click-trigger';
import typeInSearch from 'bsrs-ember/tests/helpers/type-in-search';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDL from 'bsrs-ember/vendor/defaults/dtd-link';
import LINK from 'bsrs-ember/vendor/defaults/link';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';
import waitFor from 'ember-test-helpers/wait';

let store, dtd, uuid, trans, link, field, option, dtd_repo;
const DROPDOWN = '.ember-power-select-dropdown';

moduleForComponent('dtds/dtd-single', 'integration: dtd-single test', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    generalPage.setContext(this);
    ticketPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:dtd', 'model:uuid']);
    trans = this.container.lookup('service:i18n');
    run(() => {
      dtd = store.push('dtd', {});
    });
    dtd_repo = repository.initialize(this.container, this.registry, 'dtd');
    dtd_repo.update = () => { return new Ember.RSVP.Promise(() => {}); };
    dtd_repo.findDTD = () => { return store.find('dtd'); };
  },
  afterEach() {
    page.removeContext(this);
    generalPage.removeContext(this);
    ticketPage.removeContext(this);
  }
});

test('validation on dtd key works as expected', function(assert) {
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-dtd-key-error');
  assert.equal($component.text().trim(), '');
  generalPage.save();
  $component = this.$('.t-dtd-key-error');
  assert.ok($component.is(':visible'));
  assert.equal($component.text().trim(), 'Key must be provided');
});

test('validation on dtd description works as expected', function(assert) {
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-dtd-description-error');
  assert.equal($component.text().trim(), '');
  generalPage.save();
  $component = this.$('.t-dtd-description-error');
  assert.ok($component.is(':visible'));
  assert.equal($component.text().trim(), 'Description must be provided');
});

// Links

test('validation on link text works as expected', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, key: 'foo', link_type: DTD.linkTypeOne});
    uuid = store.push('uuid', {id: 1});
    dtd.add_link({id: uuid.v4()});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-dtd-link-text-error');
  assert.equal($component.text().trim(), '');
  // assert.ok($component.is(':visible'));
  assert.equal(this.$('.t-dtd-link-request').length, 1);
  generalPage.save();
  assert.equal($component.text().trim(), 'Text must be provided');
});

test('validation - clear out text, and validation msg still works', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, link_type: DTD.linkTypeOne, dtd_link_fks: [DTDL.idOne]});
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
    link = store.push('link', {id: LINK.idOne, request: LINK.requestOne, text: LINK.textOne,
                      action_button: LINK.action_buttonOne, is_header: LINK.is_headerOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  // assert.ok($component.is(':visible'));
  assert.equal(this.$('.t-dtd-link-text-error:eq(0)').text().trim(), '');
  assert.equal(this.$('.t-dtd-link-text').length, 1);
  var add_btn = this.$('.t-add-link-btn');
  add_btn.trigger('click').trigger('change');
  assert.equal(this.$('.t-dtd-link-text').length, 2);
  assert.equal(this.$('.t-dtd-link-text-error:eq(1)').text().trim(), '');
  generalPage.save();
  assert.equal(this.$('.t-dtd-link-text-error:eq(0)').text().trim(), '');
  assert.equal(this.$('.t-dtd-link-text-error:eq(1)').text().trim(), 'Text must be provided');
});

test('add and remove dtd links', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, link_type: DTD.linkTypeOne});
    uuid = store.push('uuid', {id: 1});
    dtd.add_link({id: uuid.v4()});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-link');
  assert.ok($component.is(':visible'));
  var add_btn = this.$('.t-add-link-btn');
  assert.equal($component.find('.t-dtd-link-request').length, 1);
  assert.equal($component.find('.t-dtd-link-text').length, 1);
  assert.equal($component.find('.t-dtd-link-action_button').length, 1);
  assert.equal($component.find('.t-dtd-link-is_header').length, 0);
  assert.equal($component.find('.t-ticket-priority-select').length, 1);
  assert.equal($component.find('.t-ticket-status-select').length, 1);
  add_btn.trigger('click').trigger('change');
  assert.equal($component.find('.t-dtd-link-request').length, 2);
  add_btn.trigger('click').trigger('change');
  assert.equal($component.find('.t-dtd-link-request').length, 3);
  var remove_btn = this.$('.t-del-link-btn:eq(0)');
  remove_btn.trigger('click').trigger('change');
  assert.equal($component.find('.t-dtd-link-request').length, 2);
});

test('must have one link, cant remove last link, remove btn clears link', function(assert) {
  let links = store.find('link');
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, link_type: DTD.linkTypeOne, dtd_link_fks: [DTDL.idOne]});
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
    store.push('ticket-priority', {id: TP.priorityOneId, name: TP.priorityOne, links: [LINK.idOne]});
    store.push('ticket-status', {id: TD.statusOneId, name: TD.statusOne, links: [LINK.idOne]});
    link = store.push('link', {id: LINK.idOne, request: LINK.requestOne, text: LINK.textOne,
                      action_button: LINK.action_buttonOne, is_header: LINK.is_headerOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-link');
  assert.ok($component.is(':visible'));
  var add_btn = this.$('.t-add-link-btn');
  assert.equal($component.find('.t-dtd-link-request').length, 1);
  assert.equal($component.find('.t-dtd-link-text').length, 1);
  assert.equal($component.find('.t-dtd-link-action_button').length, 1);
  assert.equal($component.find('.t-dtd-link-is_header').length, 0);
  assert.equal($component.find('.t-ticket-priority-select').length, 1);
  assert.equal($component.find('.t-ticket-status-select').length, 1);
  assert.equal(page.request, LINK.requestOne);
  assert.equal(page.text, LINK.textOne);
  assert.equal(page.action_button(), LINK.action_buttonOne);
  assert.equal(ticketPage.priorityInput.split(' ').slice(0,-1).join(' '), trans.t(TP.priorityOne));
  assert.equal(ticketPage.statusInput.split(' ').slice(0,-1).join(' '), trans.t(TD.statusOne));
  var remove_btn = this.$('.t-del-link-btn:eq(0)');
  remove_btn.trigger('click').trigger('change');
  assert.equal(page.request, '');
  assert.equal(page.text, '');
  assert.equal(page.action_button(), LINK.action_buttonTwo);
  assert.equal(page.is_header(), LINK.is_headerTwo);
  assert.equal(ticketPage.priorityInput.split(' ').slice(0,-1).join(' '), '');
  assert.equal(ticketPage.statusInput.split(' ').slice(0,-1).join(' '), '');
});

test('add and remove dtd links', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne});
    uuid = store.push('uuid', {id: 1});
    dtd.add_link({id: uuid.v4()});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-link');
  assert.ok($component.is(':visible'));
  assert.equal(page.textIsRequiredError(), '');
  generalPage.save();
  assert.equal(page.textIsRequiredError(), 'Text must be provided');
});

test('link type selector is present and has a selection', function(assert) {
  run(() => {
    dtd = store.push('dtd', {
      id: DTD.idOne,
      dtd_link_fks: [DTDL.idOne],
      link_type: DTD.linkTypeOne
    });
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
    store.push('link', {id: LINK.idOne, request: LINK.requestOne, text: LINK.textOne,
               action_button: LINK.action_buttonOne, is_header: LINK.is_headerOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  assert.equal(page.linkTypeLength, 2);
  assert.equal(page.linkTypeLabelOne, trans.t(DTD.linkTypeOne));
  assert.equal(page.linkTypeLabelTwo, trans.t(DTD.linkTypeTwo));
  assert.ok(page.linkTypeSelectedOne());
  assert.notOk(page.linkTypeSelectedTwo());
  assert.ok(page.action_buttonVisible);
  assert.notOk(page.is_headerVisible);
  page.linkTypeTwoClick();
  assert.ok(page.linkTypeSelectedTwo());
  assert.ok(dtd.get('isDirty'));
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  assert.notOk(page.action_buttonVisible);
  assert.ok(page.is_headerVisible);
  page.linkTypeOneClick();
  assert.ok(page.linkTypeSelectedOne());
  assert.ok(dtd.get('isNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(page.action_buttonVisible);
  assert.notOk(page.is_headerVisible);
});

test('note type selector is present and has a selection', function(assert) {
  run(() => {
    dtd = store.push('dtd', {
      id: DTD.idOne,
      dtd_link_fks: [DTDL.idOne],
      note_type: DTD.noteTypeOne
    });
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, note_pk: LINK.idOne});
    store.push('link', {id: LINK.idOne, request: LINK.requestOne, text: LINK.textOne,
               action_button: LINK.action_buttonOne, is_header: LINK.is_headerOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  assert.equal(page.noteTypeInput, trans.t(DTD.noteTypeOne));
  assert.ok(dtd.get('isNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  clickTrigger('.t-dtd-note_type');
  $(`.ember-power-select-option:contains(${DTD.noteTypeTwo})`).mouseup();
  assert.equal(page.noteTypeInput, trans.t(DTD.noteTypeTwo));
  assert.ok(dtd.get('isDirty'));
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  clickTrigger('.t-dtd-note_type');
  $(`.ember-power-select-option:contains(${DTD.noteTypeOne})`).mouseup();
  assert.equal(page.noteTypeInput, trans.t(DTD.noteTypeOne));
  assert.ok(dtd.get('isNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('preview updates as changes are made to detail', function(assert) {
  run(() => {
    dtd = store.push('dtd', {
      id: DTD.idOne,
      dtd_link_fks: [DTDL.idOne],
      link_type: DTD.linkTypeOne,
      link_types: [DTD.linkTypeOne, DTD.linkTypeTwo]
    });
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
    store.push('link', {id: LINK.idOne, request: LINK.requestOne, text: LINK.textOne,
               action_button: LINK.action_buttonOne, is_header: LINK.is_headerOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}{{dtds/dtd-preview model=model}}`);
  assert.equal(page.text, LINK.textOne);
  assert.equal(page.previewButtonOne, LINK.textOne);
  page.textFillIn(LINK.textTwo);
  assert.equal(page.previewButtonOne, LINK.textTwo);
  page.textFillIn(LINK.textOne);
  assert.ok(page.previewHasButtons);
  assert.notOk(page.previewHasList);
  assert.equal(page.previewButtonOne, LINK.textOne);
  assert.ok(page.previewActionButton);
  page.action_buttonClick();
  assert.notOk(page.previewActionButton);
  page.linkTypeTwoClick();
  assert.notOk(page.previewHasButtons);
  assert.ok(page.previewHasList);
  assert.equal(page.previewLinkHeaderText, LINK.textOne);
  page.is_headerClick();
  assert.equal(page.previewButtonOne, LINK.textOne);
});

test('selecting link destination will populate dropdown with key', function(assert) {
  run(() => {
    store.clear('dtd');
    dtd = store.push('dtd', {id: DTD.idOne, key: DTD.keyOne, destination_links: [LINK.idTwo], dtd_link_fks: [DTDL.idOne]});
    store.push('link', {id: LINK.idTwo, destination_fk: DTD.idOne});
    store.push('dtd', {id: DTD.idTwo, key: DTD.keyTwo});
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idTwo});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  const COMPONENT = '.t-link-destination-select';
  clickTrigger(COMPONENT);
  run(() => { typeInSearch('a'); });
  return waitFor().
    then(() => {
      assert.equal($(DROPDOWN).length, 1);
      assert.equal($('.ember-power-select-option').length, 2);
      assert.equal($('li.ember-power-select-option:eq(0)').text().trim(), DTD.keyOne);
      assert.equal($('li.ember-power-select-option:eq(1)').text().trim(), DTD.keyTwo);
    });
});

// Fields

test('add and remove dtd fields', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_field_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    field = store.push('field', {id: FD.idOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-field');
  assert.ok($component.is(':visible'));
  assert.equal($component.find('.t-dtd-field-label').length, 1);
  assert.equal($component.find('.t-dtd-field-type').length, 1);
  assert.equal($component.find('.t-dtd-field-required').length, 1);
  var add_btn = this.$('.t-add-field-btn');
  add_btn.trigger('click').trigger('change');
  assert.equal($component.find('.t-dtd-field-label').length, 2);
  assert.equal($component.find('.t-dtd-field-type').length, 2);
  assert.equal($component.find('.t-dtd-field-required').length, 2);
  var remove_btn = this.$('.t-del-field-btn:eq(0)');
  remove_btn.trigger('click').trigger('change');
  assert.equal($component.find('.t-dtd-field-label').length, 1);
  assert.equal($component.find('.t-dtd-field-type').length, 1);
  assert.equal($component.find('.t-dtd-field-required').length, 1);
});

test('add a field - type and required values should be defaulted', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_field_fks: [1]});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-field');
  assert.ok($component.is(':visible'));
  var add_btn = this.$('.t-add-field-btn');
  add_btn.trigger('click').trigger('change');
  assert.equal(page.fieldLabelOne, '');
  assert.equal(page.fieldTypeOne, trans.t(FD.typeOne));
  assert.ok(page.fieldRequiredOneNotChecked(), FD.requiredOne);
  // field check
  assert.equal(dtd.get('fields').get('length'), 1);
  field = dtd.get('fields').objectAt(0);
  assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
});

test('update a fields values', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_field_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    field = store.push('field', {id: FD.idOne, label: FD.labelOne, type: FD.typeOne, required: FD.requestOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-field');
  assert.ok($component.is(':visible'));
  assert.equal(page.fieldLabelOne, FD.labelOne);
  assert.equal(page.fieldTypeOne, trans.t(FD.typeOne));
  assert.ok(page.fieldRequiredOneNotChecked(), FD.requiredOne);
  page.fieldLabelOneFillin(FD.labelTwo);
  page.fieldRequiredOneClick();
  assert.equal(page.fieldLabelOne, FD.labelTwo);
  assert.ok(page.fieldRequiredOneChecked(), FD.requiredTwo);
});

test('update a fields type', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_field_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    field = store.push('field', {id: FD.idOne, label: FD.labelOne, type: FD.typeThree, required: FD.requestOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-field');
  assert.ok($component.is(':visible'));
  assert.equal(page.fieldTypeOne, trans.t(FD.typeThree));
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  clickTrigger('.t-dtd-field-type');
  $(`.ember-power-select-option:contains(${FD.typeTwo})`).mouseup();
  assert.equal(page.fieldTypeOne, trans.t(FD.typeTwo));
  assert.ok(dtd.get('fieldsIsDirty'));
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  clickTrigger('.t-dtd-field-type');
  $(`.ember-power-select-option:contains(${FD.typeThree})`).mouseup();
  assert.equal(page.fieldTypeOne, trans.t(FD.typeThree));
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

// Options

test('add and remove dtd field options', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_field_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    field = store.push('field', {id: FD.idOne, label: FD.labelOne, type: FD.typeSix, required: FD.requestOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-field');
  assert.ok($component.is(':visible'));
  assert.equal(page.fieldLabelOne, FD.labelOne);
  assert.equal($component.find('.t-dtd-field-option-text').length, 0);
  var add_btn = this.$('.t-add-field-option-btn');
  add_btn.trigger('click').trigger('change');
  assert.equal($component.find('.t-dtd-field-option-text').length, 1);
  var remove_btn = this.$('.t-remove-field-option-btn');
  remove_btn.trigger('click').trigger('change');
  assert.equal($component.find('.t-dtd-field-option-text').length, 0);
});

/* jshint ignore:start */
test('hide or show options based on field.type', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_field_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    field = store.push('field', {id: FD.idOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-field');
  assert.ok($component.is(':visible'));
  let type;
  const types = field.get('types');
  const typesWithOptions = field.get('typesWithOptions');
  for (var i = 0; i < field.get('types').length; i++) {
    type = types[i];
    run(() => {
      store.push('field', {id: FD.idOne, type: type});
    });
    if (typesWithOptions.includes(type)) {
      assert.equal($component.find('.t-add-field-option-btn').length, 1);
    } else {
      assert.equal($component.find('.t-add-field-option-btn').length, 0);
    }
  }
});
/* jshint ignore:end */

test('update a field by adding option values', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_field_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    field = store.push('field', {id: FD.idOne, label: FD.labelOne, type: FD.typeSix, required: FD.requestOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-field');
  var add_btn = this.$('.t-add-field-option-btn');
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  add_btn.trigger('click').trigger('change');
  assert.equal($component.find('.t-dtd-field-option-text').length, 1);
  assert.equal(page.fieldOneOptionText, '');
  page.fieldOneOptionTextFillin(OD.textOne);
  assert.equal(page.fieldOneOptionText, OD.textOne);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

test('update a fields existing option', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_field_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    field = store.push('field', {id: FD.idOne, label: FD.labelOne, type: FD.typeSix, required: FD.requestOne, field_option_fks: [1]});
    store.push('field-option', {id: 1, field_pk: FD.idOne, option_pk: OD.idOne});
    option = store.push('option', {id: OD.idOne, text: OD.textOne, order: OD.orderOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-field');
  assert.equal($component.find('.t-dtd-field-option-text').length, 1);
  assert.equal(page.fieldOneOptionText, OD.textOne);
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
  page.fieldOneOptionTextFillin(OD.textTwo);
  assert.equal(page.fieldOneOptionText, OD.textTwo);
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});

test('instead of `Save and Close`, say `Save` for save button because layout is diff from other modules', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, key: 'foo', link_type: DTD.linkTypeOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-save-btn');
  assert.equal($component.text().trim(), trans.t('crud.save_only.button'));
});
