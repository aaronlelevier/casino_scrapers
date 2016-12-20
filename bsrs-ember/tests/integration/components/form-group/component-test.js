import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('form-group', 'Integration | Component | form group', {
  integration: true
});

test('defaults to not use readonly as a classname', function(assert) {
  this.set('readonly', false);

  this.render(hbs`
    {{#form-group
      title="Awesome Sauce"
      for="my_burrito"
      readonly=readonly
    }}
      <input placeholder="name">
    {{/form-group}}
  `);

  let el = this.$('.form-group').first();
  assert.equal(el.hasClass('readonly'), false, 'readonly class not used');
});

test('uses readonly as a classname', function(assert) {
  this.set('readonly', true);

  this.render(hbs`
    {{#form-group
      title="Awesome Sauce"
      for="my_burrito"
      readonly=readonly
    }}
      <input placeholder="name">
    {{/form-group}}
  `);

  let el = this.$('.form-group').first();
  assert.equal(el.hasClass('readonly'), true, 'readonly class is used');
});
