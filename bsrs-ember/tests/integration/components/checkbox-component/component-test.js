import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('checkbox-component', 'Integration | Component | checkbox component', {
  integration: true
});

test('it renders with api', function(assert) {
  this.labelClass = 'wat';
  this.labelText = 'watfoo';
  this.checkboxText = 'watbar';
  this.checked = false;
  this.inputClass = 'watter';
  this.dataTestId = 't-watter';
  this.render(hbs`{{checkbox-component dataTestId=dataTestId inputClass=inputClass checked=checked checkboxText=checkboxText labelText=labelText labelClass=labelClass}}`);
  assert.equal(this.$('span').text().trim(), this.checkboxText);
  assert.ok(this.$('input').attr('class').includes(this.inputClass));
  assert.ok(this.$('label').attr('class').includes(this.labelClass));
  assert.equal(this.$('label').attr('data-test-id'), this.dataTestId);
});
