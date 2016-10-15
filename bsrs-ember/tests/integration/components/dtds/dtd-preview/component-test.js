import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from "bsrs-ember/vendor/translation_fixtures";
import hbs from 'htmlbars-inline-precompile';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import FD from 'bsrs-ember/vendor/defaults/field';
import page from 'bsrs-ember/tests/pages/dtd';

var dtd, store, trans;

moduleForComponent('dtds/dtd-preview', 'Integration | Component | dtds/dtd preview', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:dtd']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    var json = translations.generate('en');
    loadTranslations(trans, json);
    const dtd_data = DTDF.generate();
    delete dtd_data.fields;
    run(() => {
      dtd = store.push('dtd', dtd_data);
    });
  },
  afterEach(){
    page.removeContext(this);
  }
});

test('preview renders with model data passed from dtd route - v1', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: dtd.get('id'), note_type: ''});
  });
  this.model = dtd;
  this.render(hbs`{{dtds/dtd-preview model=model}}`);
  assert.equal(page.previewDescription, DTD.descriptionOne);
  assert.equal(page.previewPrompt, DTD.promptOne);
  assert.equal(page.previewNote, DTD.noteOne);
  assert.ok(page.previewHasButtons);
  assert.notOk(page.previewHasList);
  //TODO: (Andy) not sure why this was here...
  // assert.equal(page.previewButtonOne, LINK.textOne);
  // Add back when needed
  // assert.equal(this.$('.t-dtd-preview-note_type').text().trim(), DTD.noteTypeOne);
  const $component = this.$('.t-dtd-preview-note');
  assert.ok($component.hasClass('alert-info'));
});

test('note_type determines class on note (success, info, warning, danger)', function(assert) {
  run(() => {
    store.push('dtd', {note_type: dtd.note_types[0]});
  });
  this.model = dtd;
  this.render(hbs`{{dtds/dtd-preview model=model}}`);
  const $component = this.$('.t-dtd-preview-note');
  const className = trans.t(dtd.get('note_type')).string.toLowerCase();
  assert.ok($component.hasClass(`alert-${className}`));
});

test('if no description, not displayed', function(assert) {
  run(() => {
    store.push('dtd', {id: dtd.get('id'), description: ''});
  });
  this.model = dtd;
  this.render(hbs`{{dtds/dtd-preview model=model}}`);
  assert.notOk(this.$('.panel-body > p').hasClass('t-dtd-preview-description'));
  run(() => {
    store.push('dtd', {id: dtd.get('id'), description: DTD.descriptionOne});
  });
  assert.ok(this.$('.panel-body > p').hasClass('t-dtd-preview-description'));
});

test('if no prompt, not displayed', function(assert) {
  run(() => {
    store.push('dtd', {id: dtd.get('id'), prompt: ''});
  });
  this.model = dtd;
  this.render(hbs`{{dtds/dtd-preview model=model}}`);
  assert.notOk(this.$('.panel-footer').hasClass('t-dtd-preview-prompt'));
  run(() => {
    store.push('dtd', {id: dtd.get('id'), prompt: DTD.promptOne});
  });
  assert.ok(this.$('.panel-footer').hasClass('t-dtd-preview-prompt'));
});

test('if no fields, not displayed...text type displays properly', function(assert) {
  assert.equal(dtd.get('fields').get('length'), 0);
  run(() => {
    store.push('dtd', {id: dtd.get('id'), prompt: ''});
    store.push('field', {id: FD.idOne, label: FD.labelOne, type: FD.typeOne, field_field_fks: [1]});
    store.push('dtd-field', {id: 1, dtd_pk: DTD.idOne, field_pk: FD.idOne});
  });
  assert.equal(dtd.get('fields').get('length'), 1);
  this.model = dtd;
  this.render(hbs`{{dtds/dtd-preview model=model}}`);
  assert.equal(this.$('.t-dtd-preview-field-label').text().trim(), FD.labelOne);
  assert.equal(this.$('input.t-dtd-field-preview:eq(0)').attr('type'), 'text');
});
