import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('grid/grid-head', 'Integration | Component | grid-head-desktop', {
  integration: true,
  beforeEach() {
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'desktop').begin + 5;
    flexi.set('width', width);
  },
});

test('if no exportGrid, doesnt show exportGrid btn', function(assert) {
  this.exportGrid = false;
  this.render(hbs`{{grid/helpers/grid-head exportGrid=exportGrid}}`);
  assert.equal(this.$('[data-test-id=grid-export-btn]').length, 0);
  this.set('exportGrid', true);
  this.render(hbs`{{grid/helpers/grid-head exportGrid=exportGrid}}`);
  assert.equal(this.$('[data-test-id=grid-export-btn]').length, 1);
  assert.equal(this.$('[data-test-id=grid-export-btn] i').length, 1);
});
