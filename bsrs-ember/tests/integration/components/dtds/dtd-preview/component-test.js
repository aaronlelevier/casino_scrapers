import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import LINK from 'bsrs-ember/vendor/defaults/link';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import page from 'bsrs-ember/tests/pages/dtd';

var dtd, store;

moduleForComponent('dtds/dtd-preview', 'Integration | Component | dtds/dtd preview', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:dtd']);
    run(() => {
      dtd = store.push('dtd', DTDF.generate());
    });
  },
  afterEach(){
    page.removeContext(this);
  }
});

test('preview renders with model data passed from dtd route - v1', function(assert) {
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
});
