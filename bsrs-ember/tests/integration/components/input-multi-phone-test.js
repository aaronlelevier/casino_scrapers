import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import initializer from "bsrs-ember/instance-initializers/ember-i18n";

var People = Ember.Object.extend({
  phonenumbers: null
});

var XNumber = Ember.Object.extend({
  number: ''
});

moduleForComponent('input-multi-phone', 'integration: input-multi-phone test', {
  integration: true,
  setup: function() {
    initializer.initialize(this);
  }
});

test('input multi phone defaults to use phone number model with field name of number', function(assert) {
  this.registry.register('model:x-number', XNumber);

  var model = People.create({ phonenumbers: []});
  this.set('model', model);

  this.render(hbs`{{input-multi-phone model=model.phonenumbers}}`);

  var $component = this.$('.t-input-multi-phone');

  assert.equal(this.$('.t-new-entry').length, 0);

  var $first_btn = $component.find('.t-add-btn:eq(0)');

  $first_btn.trigger('click');

  assert.equal(this.$('.t-new-entry').length, 1);

  assert.equal(model.get('phonenumbers').length, 1);

  assert.equal(model.get('phonenumbers').objectAt(0).get('number'), '');

  this.$('.t-new-entry').val('andier').trigger('change');

  assert.equal(model.get('phonenumbers').objectAt(0).get('number'), 'andier');
});
