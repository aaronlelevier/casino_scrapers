import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';

var store;

moduleForComponent('dtds/dtd-header', 'Integration | Component | dtds/dtd header', {
  integration: true,
    setup() {
        translation.initialize(this);
        store = module_registry(this.container, this.registry, ['model:dtd', 'model:dtd-header']);
        run(() => {
            store.push('dtd-header', {id: 1});
        });
        trans = this.container.lookup('service:i18n');
        loadTranslations(trans, translations.generate('en'));
        translation.initialize(this);
    }
});

test('it renders with links', function(assert) {
  this.render(hbs`
    {{#dtds/dtd-header}}
    {{/dtds/dtd-header}}
  `);
  assert.equal(this.$('button:eq(0)').text().trim(), 'List');
  assert.equal(this.$('button:eq(1)').text().trim(), 'Detail');
  assert.equal(this.$('button:eq(2)').text().trim(), 'Preview');
});
