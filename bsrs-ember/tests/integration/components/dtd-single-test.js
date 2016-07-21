import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import repository from 'bsrs-ember/tests/helpers/repository';
import { typeInSearch, clickTrigger, nativeMouseUp } from '../../helpers/ember-power-select';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDL from 'bsrs-ember/vendor/defaults/dtd-link';
import LINK from 'bsrs-ember/vendor/defaults/link';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import TP from 'bsrs-ember/vendor/defaults/ticket-priority';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/category';
import TCD from 'bsrs-ember/vendor/defaults/model-category';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';
import waitFor from 'ember-test-helpers/wait';

let store, dtd, uuid, trans, link, field, option, dtd_repo;
const DROPDOWN = '.ember-power-select-dropdown';
const FIELD_TYPE = '.t-dtd-field-type';
const ERR_TEXT = '.validated-input-error-dialog';

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
    const flexi = this.container.lookup('service:device/layout');
    let breakpoints = flexi.get('breakpoints');
    let bp = {};
    breakpoints.forEach((point) => {
      bp[point.name] = point.begin + 5;
    });
    flexi.set('width', bp.desktop);
  },
  afterEach() {
    page.removeContext(this);
    generalPage.removeContext(this);
    ticketPage.removeContext(this);
  }
});

test('validation on dtd key works', function(assert) {
  var done = assert.async();
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'key';
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  const $component = this.$('.invalid');
  assert.equal($component.text().trim(), '');
  page.keyFillIn('wat');
  assert.equal(page.key, 'wat');
  assert.notOk($component.is(':visible'));
  this.$('.t-dtd-single-key:eq(0)').val('').keyup();
  Ember.run.later(() => {
    const $component = this.$('.invalid');
    assert.ok($component.is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.dtd.key'));
    this.$('.t-dtd-single-key:eq(0)').val('a'.repeat(12)).keyup();
    Ember.run.later(() => {
      const $component = this.$('.invalid');
      assert.notOk($component.is(':visible'));
      this.$('.t-dtd-single-key:eq(0)').val('a'.repeat(13)).keyup();
      Ember.run.later(() => {
        const $component = this.$('.invalid');
        assert.ok($component.is(':visible'));
        assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.dtd.key.length'));
        done();
      }, 1800);
    }, 200);
  }, 1800);
});

test('validation on fields when click save', function(assert) {
  var done = assert.async();
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'key';
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.invalid');
  assert.equal($component.text().trim(), '');
  const add_btn = this.$('.t-add-link-btn');
  add_btn.trigger('click').trigger('change');
  assert.equal($('.t-link-destination-select .ember-power-select-placeholder').text(), trans.t('dt.placeholder_submit'));
  generalPage.save();
  Ember.run.later(() => {
    const $key_component = this.$('.t-dtd-key');
    const $link_text_component = this.$('.t-link-text');
    assert.ok($key_component.is(':visible'));
    assert.ok($key_component.hasClass('invalid'));
    assert.equal($(`${ERR_TEXT}:eq(0)`).text().trim(), trans.t('errors.dtd.key'));
    assert.equal($(`${ERR_TEXT}:eq(1)`).text().trim(), trans.t('errors.link.text'));
    done();
  }, 300);
});

// Links

test('validation - clear out text, and validation msg still works', function(assert) {
  var done = assert.async();
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'text';
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, link_type: DTD.linkTypeOne, dtd_links_fks: [DTDL.idOne]});
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
    link = store.push('link', {id: LINK.idOne, request: LINK.requestOne, text: LINK.textOne,
                      action_button: LINK.action_buttonOne, is_header: LINK.is_headerOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  const $component = this.$('.invalid');
  assert.notOk($component.is(':visible'));
  this.$('.t-dtd-link-text:eq(0)').val('').keyup();
  Ember.run.later(() => {
    const $component = this.$('.invalid');
    assert.ok($component.is(':visible'));
    assert.equal($(`${ERR_TEXT}:eq(0)`).text().trim(), trans.t('errors.link.text'));
    done();
  }, 1800);
});

test('add and remove dtd links', function(assert) {
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'text';
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, link_type: DTD.linkTypeOne});
    uuid = store.push('uuid', {id: 1});
    dtd.add_link({id: uuid.v4(), order: 0});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-link');
  assert.ok($component.is(':visible'));
  var add_btn = this.$('.t-add-link-btn');
  let link = dtd.get('links').objectAt(0);
  assert.equal(link.get('order'), 0);
  assert.equal($component.find('.t-dtd-link-request').length, 1);
  assert.equal($component.find('.t-dtd-link-text').length, 1);
  assert.equal($component.find('.t-dtd-link-action_button').length, 1);
  assert.equal($component.find('.t-dtd-link-is_header').length, 0);
  assert.equal($component.find('.t-ticket-priority-select').length, 1);
  assert.equal($component.find('.t-ticket-status-select').length, 1);
  add_btn.trigger('click').trigger('change');
  link = dtd.get('links').objectAt(1);
  assert.equal(link.get('order'), 1);
  assert.equal($component.find('.t-dtd-link-request').length, 2);
  add_btn.trigger('click').trigger('change');
  link = dtd.get('links').objectAt(2);
  assert.equal(link.get('order'), 2);
  assert.equal($component.find('.t-dtd-link-request').length, 3);
  var remove_btn = this.$('.t-del-link-btn:eq(0)');
  remove_btn.trigger('click').trigger('change');
  assert.equal($component.find('.t-dtd-link-request').length, 2);
});

test('must have one link, cant remove last link, remove btn clears link', function(assert) {
  let links = store.find('link');
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, link_type: DTD.linkTypeOne, dtd_links_fks: [DTDL.idOne]});
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

test('link type selector is present and has a selection', function(assert) {
  run(() => {
    dtd = store.push('dtd', {
      id: DTD.idOne,
      dtd_links_fks: [DTDL.idOne],
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
      dtd_links_fks: [DTDL.idOne],
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
  nativeMouseUp(`.ember-power-select-option:contains(${DTD.noteTypeTwo})`);
  assert.equal(page.noteTypeInput, trans.t(DTD.noteTypeTwo));
  assert.ok(dtd.get('isDirty'));
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  clickTrigger('.t-dtd-note_type');
  nativeMouseUp(`.ember-power-select-option:contains(${DTD.noteTypeOne})`);
  assert.equal(page.noteTypeInput, trans.t(DTD.noteTypeOne));
  assert.ok(dtd.get('isNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

test('preview updates as changes are made to detail (w/ no fields)', function(assert) {
  run(() => {
    dtd = store.push('dtd', {
      id: DTD.idOne,
      dtd_links_fks: [DTDL.idOne],
      link_type: DTD.linkTypeOne,
      link_types: [DTD.linkTypeOne, DTD.linkTypeTwo],
      destination_links: [LINK.idOne]
    });
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
    store.push('link', {id: LINK.idOne, request: LINK.requestOne, text: LINK.textOne,
               action_button: LINK.action_buttonOne, is_header: LINK.is_headerOne, destination_fk: DTD.idOne});
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

// Links - Categories
test('dtd-link category select', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_links_fks: [DTDL.idOne]});
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idOne});
    store.push('model-category', {id: TCD.idOne, model_pk: LINK.idOne, category_pk: CD.idOne});
    store.push('category', {id: CD.idOne, name: CD.nameOne, label: CD.labelOne});
    link = store.push('link', {id: LINK.idOne, model_categories_fks: [TCD.idOne, TCD.idTwo, TCD.idThree]});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  assert.equal(dtd.get('links').get('length'), 1);
  assert.equal(link.get('categories').get('length'), 1);
  assert.equal(this.$('.t-model-category-label').text().trim(), CD.labelOne);
  assert.equal(this.$('.t-model-category-select').text().trim().split(/\s+/)[0], CD.nameOne);
  // assert.equal(this.$('.t-model-category-select').text().trim().split(/\s+/)[1], '×');//bad test b/c if power select changes, then this will fail
  assert.equal(this.$('.t-model-category-select').text().trim().split(/\s+/)[1].length, 1);
});

// Fields
test('no field label does not display undefined', function(assert) {
  run(() => {
    dtd = store.push('dtd', {
      id: DTD.idOne,
      dtd_fields_fks: [DTDL.idOne],
    });
    store.push('dtd-field', {id: DTDL.idOne, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    store.push('field', {id: FD.idOne, label: undefined, type: FD.typeOne});
    store.push('option', {id: OD.idOne, text: OD.textOne});
    store.push('field-option', {id: 1, field_pk: FD.idOne, option_pk: OD.idOne});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}{{dtds/dtd-preview model=model}}`);
  assert.equal(this.$('.t-dtd-preview-field-label').text().trim(), '');
});

test('preview updates as fields changes are made to detail', function(assert) {
  run(() => {
    dtd = store.push('dtd', {
      id: DTD.idOne,
      dtd_fields_fks: [DTDL.idOne],
    });
    store.push('dtd-field', {id: DTDL.idOne, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    store.push('field', {id: FD.idOne, label: FD.labelOne, type: FD.typeOne});
    store.push('option', {id: OD.idOne, text: OD.textOne});
    store.push('field-option', {id: 1, field_pk: FD.idOne, option_pk: OD.idOne});
  });
  assert.equal(dtd.get('fields').objectAt(0).get('label'), FD.labelOne);
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}{{dtds/dtd-preview model=model}}`);
  assert.equal(this.$('.t-dtd-preview-field-label').text().trim(), FD.labelOne);
  //text
  page.fieldLabelOneFillin(FD.labelTwo);
  assert.equal(page.fieldLabelOne, FD.labelTwo);
  assert.equal(this.$('.t-dtd-preview-field-label').text().trim(), FD.labelTwo);
  assert.equal(this.$('input.t-dtd-field-preview').attr('type'), 'text');
  //number
  clickTrigger(FIELD_TYPE);
  page.fieldTypeOneClickOptionTwo();
  nativeMouseUp(`.ember-power-select-option:contains(${FD.typeTwo})`);
  assert.equal(this.$('input.t-dtd-field-preview').attr('type'), 'number');
  clickTrigger(FIELD_TYPE);
  //textarea
  page.fieldTypeOneClickOptionThree();
  nativeMouseUp(`.ember-power-select-option:contains(${FD.typeThree})`);
  assert.ok(this.$('textarea').hasClass('t-dtd-field-preview'));
  clickTrigger(FIELD_TYPE);
  page.fieldTypeOneClickOptionFourTranslated();
  //select
  nativeMouseUp(`.ember-power-select-option:contains(${FD.typeFour})`);
  clickTrigger('.t-dtd-field-select');
  assert.equal(page.fieldOptionOne, 'yes');
  page.fieldOneAddFieldOption();
  page.fieldTwoOptionTextFillin(OD.textTwo);
  assert.equal(page.fieldTwoOptionText, OD.textTwo);
  assert.equal(page.fieldOptionTwo, OD.textTwo);
  //checkbox
  clickTrigger(FIELD_TYPE);
  page.fieldTypeOneClickOptionSix();
  nativeMouseUp(`.ember-power-select-option:contains(${FD.typeSix})`);
  assert.equal(this.$('.t-dtd-preview-field-label').text().trim(), FD.labelTwo);
  assert.ok(this.$('div').hasClass('checkbox'));
  assert.equal(this.$('.t-dtd-preview-field div.checkbox:eq(0)').text().trim(), OD.textOne);
  assert.equal(this.$('.t-dtd-preview-field div.checkbox:eq(1)').text().trim(), OD.textTwo);
});

test('selecting link destination will populate dropdown with key', function(assert) {
  run(() => {
    store.clear('dtd');
    dtd = store.push('dtd', {id: DTD.idOne, key: DTD.keyOne, destination_links: [LINK.idTwo], dtd_links_fks: [DTDL.idOne]});
    store.push('link', {id: LINK.idTwo, destination_fk: DTD.idOne});
    store.push('dtd', {id: DTD.idTwo, key: DTD.keyTwo, destination_pk: LINK.idTwo});
    store.push('dtd-link', {id: DTDL.idOne, dtd_pk: DTD.idOne, link_pk: LINK.idTwo});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  const COMPONENT = '.t-link-destination-select';
  assert.equal($('.ember-power-select-option').length, 0);
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

test('add and remove dtd fields', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_fields_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
    field = store.push('field', {id: FD.idOne, order: 0});
  });
  this.set('model', dtd);
  this.render(hbs`{{dtds/dtd-single model=model}}`);
  let $component = this.$('.t-input-multi-dtd-field');
  assert.ok($component.is(':visible'));
  let field = dtd.get('fields').objectAt(0);
  assert.equal(field.get('order'), 0);
  assert.equal($component.find('.t-dtd-field-label').length, 1);
  assert.equal($component.find(FIELD_TYPE).length, 1);
  assert.equal($component.find('.t-dtd-field-required').length, 1);
  var add_btn = this.$('.t-add-field-btn');
  add_btn.trigger('click').trigger('change');
  field = dtd.get('fields').objectAt(1);
  assert.equal(field.get('order'), 1);
  assert.equal($component.find('.t-dtd-field-label').length, 2);
  assert.equal($component.find(FIELD_TYPE).length, 2);
  assert.equal($component.find('.t-dtd-field-required').length, 2);
  var remove_btn = this.$('.t-del-field-btn:eq(0)');
  remove_btn.trigger('click').trigger('change');
  assert.equal($component.find('.t-dtd-field-label').length, 1);
  assert.equal($component.find(FIELD_TYPE).length, 1);
  assert.equal($component.find('.t-dtd-field-required').length, 1);
});

test('add a field - type and required values should be defaulted', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_fields_fks: [1]});
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
    dtd = store.push('dtd', {id: DTD.idOne, dtd_fields_fks: [1]});
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
    dtd = store.push('dtd', {id: DTD.idOne, dtd_fields_fks: [1]});
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
  clickTrigger(FIELD_TYPE);
  nativeMouseUp(`.ember-power-select-option:contains(${FD.typeTwo})`);
  assert.equal(page.fieldTypeOne, trans.t(FD.typeTwo));
  assert.ok(dtd.get('fieldsIsDirty'));
  assert.ok(dtd.get('isDirtyOrRelatedDirty'));
  clickTrigger(FIELD_TYPE);
  nativeMouseUp(`.ember-power-select-option:contains(${FD.typeThree})`);
  assert.equal(page.fieldTypeOne, trans.t(FD.typeThree));
  assert.ok(dtd.get('fieldsIsNotDirty'));
  assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
});

// Options
test('add and remove dtd field options', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_fields_fks: [1]});
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
  let option = field.get('options').objectAt(0);
  assert.equal(option.get('order'), 0);
  assert.equal($component.find('.t-dtd-field-option-text').length, 1);
  add_btn.trigger('click').trigger('change');
  option = field.get('options').objectAt(1);
  assert.equal(option.get('order'), 1);
  assert.equal($component.find('.t-dtd-field-option-text').length, 2);
  var remove_btn = this.$('.t-remove-field-option-btn');
  remove_btn.trigger('click').trigger('change');
  assert.equal($component.find('.t-dtd-field-option-text').length, 0);
});

/* jshint ignore:start */
test('hide or show options based on field.type', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: DTD.idOne, dtd_fields_fks: [1]});
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
    dtd = store.push('dtd', {id: DTD.idOne, dtd_fields_fks: [1]});
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
    dtd = store.push('dtd', {id: DTD.idOne, dtd_fields_fks: [1]});
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
