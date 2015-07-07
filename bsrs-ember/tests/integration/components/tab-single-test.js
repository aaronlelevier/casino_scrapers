import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import initializer from "bsrs-ember/instance-initializers/ember-i18n";
import faInitializer from "bsrs-ember/instance-initializers/ember-i18n";
import Ember from 'ember';

function createTab(id) {
  return Ember.Object.create({
    id: id,
  });
}//createTab


moduleForComponent('tab-single', 'integration: tab-single test', {
  integration: true,
  setup: function() {
    initializer.initialize(this);
    faInitializer.initialize(this);
  }
});

//test('renders a single button with a class of t-add-btn', function(assert){
//
//  //this.render(hbs`{{tab-single model=things}}`);
//  //var $component = this.$('.t-input-multi');
//  //assert.equal($component.find('.t-add-btn').length, 1);
//
//});
//
//
//test('click add btn will append tab to list of entries and binds value to model', function(assert) {
//
//  //this.registry.register('model:x-number', XNumber);
//
//  //// Create an empty model to push new entries into
//  //var model = People.create({ phonenumbers: []});
//  //this.set('model', model);
//
//  //// render the component - a new entry will be a phone number, and the value will be a "number"
//  //this.render(hbs`{{tab-single model=model.phonenumbers modelType="x-number" fieldNames="number"}}`);
//
//  ////get a jQuery handle to the component
//  //var $component = this.$('.t-input-multi');
//
//  ////make sure that there is no input to start
//  //assert.equal(this.$('.t-new-entry').length, 0);
//
//  ////get a jQ handle to the add button
//  //var $first_btn = $component.find('.t-add-btn:eq(0)');
//
//  ////click the add button
//  //$first_btn.trigger('click');
//
//  ////make sure there is now 1 empty input
//  //assert.equal(this.$('.t-new-entry').length, 1);
//
//  ////make sure that we also added a record to the model
//  //assert.equal(model.get('phonenumbers').length, 1);
//
//  ////make sure that the record is blank
//  //assert.equal(model.get('phonenumbers').objectAt(0).get('number'), '');
//
//  //this.$('.t-new-entry').val('andier').trigger('change');
//
//  //assert.equal(model.get('phonenumbers').objectAt(0).get('number'), 'andier');
//
//
//});
//
//
//test('click close btn will remove tab', function(assert) {
//
//});
//
//
//test('model with existing array of tabs is shown at render and bound to model', function(assert) {
//
//});


