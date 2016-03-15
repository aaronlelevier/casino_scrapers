import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';

var dtd, store;

moduleForComponent('dtds/dtd-preview', 'Integration | Component | dtds/dtd preview', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:dtd']);
        run(() => {
            dtd = store.push('dtd', DTDF.generate());
        });
    }
});

test('it renders with model data passed from dtd route', function(assert) {
    this.model = dtd;
    this.render(hbs`{{dtds/dtd-preview model=model}}`);
    // assert.equal(this.$('.t-dtd-preview-key').text().trim(), DTD.keyOne);
    assert.equal(this.$('.t-dtd-preview-description').text().trim(), DTD.descriptionOne);
    assert.equal(this.$('.t-dtd-preview-prompt').text().trim(), DTD.promptOne);
    assert.equal(this.$('.t-dtd-preview-note').text().trim(), DTD.noteOne);
    // assert.equal(this.$('.t-dtd-preview-note_type').text().trim(), DTD.noteTypeOne);
    // assert.equal(this.$('.t-dtd-preview-link_type').text().trim(), DTD.linkTypeOne);
});
