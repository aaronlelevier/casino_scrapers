import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from "bsrs-ember/vendor/translation_fixtures";
import hbs from 'htmlbars-inline-precompile';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import LINK from 'bsrs-ember/vendor/defaults/link';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
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
    run(() => {
      dtd = store.push('dtd', DTDF.generate());
    });
  },
  afterEach(){
    page.removeContext(this);
  }
});

test('preview renders with model data passed from dtd route - v1', function(assert) {
  run(() => {
    dtd = store.push('dtd', {id: dtd.get('id'), note_type: ''});
  })
  this.model = dtd;
  this.render(hbs`{{dtds/dtd-preview model=model}}`);
  assert.equal(page.previewDescription, DTD.descriptionOne);
  assert.equal(page.previewPrompt, DTD.promptOne);
  assert.equal(page.previewNote, DTD.noteOne);
  assert.ok(page.previewHasButtons);
  assert.notOk(page.previewHasList);
  assert.equal(page.previewButtonOne, LINK.textOne);
  // Add back when needed
  // assert.equal(this.$('.t-dtd-preview-note_type').text().trim(), DTD.noteTypeOne);
  const $component = this.$('.t-dtd-note-preview');
  assert.ok($component.hasClass('alert-info'));
});

test('note_type determines class on note (success, info, warning, danger)', function(assert) {
  run(() => {
    store.push('dtd', {note_type: dtd.note_types[0]});
  });
  this.model = dtd;
  this.render(hbs`{{dtds/dtd-preview model=model}}`);
  const $component = this.$('.t-dtd-note-preview');
  const className = trans.t(dtd.get('note_type')).string.toLowerCase();
  assert.ok($component.hasClass(`alert-${className}`));
});
