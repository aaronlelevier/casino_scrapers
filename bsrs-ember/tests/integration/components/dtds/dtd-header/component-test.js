import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dtds/dtd-header', 'Integration | Component | dtds/dtd header', {
  integration: true
});

test('it renders with links', function(assert) {
  this.render(hbs`
    {{#dtds/dtd-header}}
    {{/dtds/dtd-header}}
  `);
  assert.equal(this.$().text().trim(), 'LIST\nDETAIL\nPREVIEW');
});
