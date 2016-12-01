import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('grid-no-data', 'Integration | Component | grid no data', {
  integration: true
});

test('checks for binoculars icon and no results icon', function(assert) {
  this.render(hbs`{{grid-no-data ltagName="tr" class="no-results" length=1}}`);
  assert.ok(this.$('td').prop('colspan') === 1);
  assert.equal(this.$('.fa-binoculars').length, 1);
  assert.equal(this.$('.no-results').text().trim(), 'grid.no_results');
});
