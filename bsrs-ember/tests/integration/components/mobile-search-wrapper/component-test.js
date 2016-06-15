import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('mobile-search-wrapper', 'Integration | Component | mobile search wrapper', {
  integration: true
});

test('it renders with fa icon search', function(assert) {
  this.render(hbs`{{mobile-search-wrapper}}`);
  assert.ok(this.$('span > i').hasClass('fa-search'));
});
