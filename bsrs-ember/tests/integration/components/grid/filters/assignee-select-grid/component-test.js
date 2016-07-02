import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('grid/filters/assignee-select-grid', 'Integration | Component | grid/filters/assignee select grid', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{grid/filters/assignee-select-grid}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#grid/filters/assignee-select-grid}}
      template block text
    {{/grid/filters/assignee-select-grid}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
