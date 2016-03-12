import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store; 

moduleForComponent('dtds/dtd-header', 'Integration | Component | dtds/dtd header', {
  integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:dtd', 'model:dtd-header']);
        run(() => {
            store.push('dtd-header', {id: 1});
        });
    }
});

test('it renders with links', function(assert) {
  this.render(hbs`
    {{#dtds/dtd-header}}
    {{/dtds/dtd-header}}
  `);
  assert.equal(this.$().text().trim(), 'LIST\nDETAIL\nPREVIEW');
});
