import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('card-section', 'Integration | Component | card section', {
  integration: true
});

test('it renders as a section tag', function(assert) {
  this.render(hbs`{{#card-section}} {{/card-section}}`);
  assert.equal(this.$('section').length, 1);
});
