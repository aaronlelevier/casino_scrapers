import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store;

moduleForComponent('person-new', 'integration: person-new test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:phonenumber']);
        translation.initialize(this);
    }
});

test('filling in invalid username reveal validation messages', function(assert) {
    this.set('model', store.push('person', {}));
    this.render(hbs`{{person-new model=model}}`);
    var $component = this.$('.t-username-validation-error');
    assert.ok(this.$('.t-username-validation-error').is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok(this.$('.t-username-validation-error').is(':visible'));
    this.$('.t-person-username').val('a').trigger('change');
    assert.ok(this.$('.t-username-validation-error').is(':hidden'));
});

test('filling in invalid password reveal validation messages', function(assert) {
    this.set('model', store.push('person', {}));
    this.render(hbs`{{person-new model=model}}`);
    var $component = this.$('.t-password-validation-error');
    assert.ok(this.$('.t-password-validation-error').is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok(this.$('.t-password-validation-error').is(':visible'));
    this.$('.t-person-password').val('a').trigger('change');
    assert.ok(this.$('.t-password-validation-error').is(':hidden'));
});

test('filling in invalid first name reveal validation messages', function(assert) {
    this.set('model', store.push('person', {}));
    this.render(hbs`{{person-new model=model}}`);
    var $component = this.$('.t-first-name-validation-error');
    assert.ok(this.$('.t-first-name-validation-error').is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok(this.$('.t-first-name-validation-error').is(':visible'));
    this.$('.t-person-first-name').val('a').trigger('change');
    assert.ok(this.$('.t-first-name-validation-error').is(':hidden'));
});

test('filling in invalid last name reveal validation messages', function(assert) {
    this.set('model', store.push('person', {}));
    this.render(hbs`{{person-new model=model}}`);
    var $component = this.$('.t-last-name-validation-error');
    assert.ok(this.$('.t-last-name-validation-error').is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok(this.$('.t-last-name-validation-error').is(':visible'));
    this.$('.t-person-last-name').val('a').trigger('change');
    assert.ok(this.$('.t-last-name-validation-error').is(':hidden'));
});

test('filling in invalid email reveal validation messages', function(assert) {
    this.set('model', store.push('person', {}));
    this.render(hbs`{{person-new model=model}}`);
    var $component = this.$('.t-email-validation-error');
    assert.ok(this.$('.t-email-validation-error').is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok(this.$('.t-email-validation-error').is(':visible'));
    this.$('.t-person-email').val('a').trigger('change');
    assert.ok(this.$('.t-email-validation-error').is(':visible'));
    this.$('.t-person-email').val('a@').trigger('change');
    assert.ok(this.$('.t-email-validation-error').is(':visible'));
    this.$('.t-person-email').val('a@b').trigger('change');
    assert.ok(this.$('.t-email-validation-error').is(':visible'));
    this.$('.t-person-email').val('a@b.').trigger('change');
    assert.ok(this.$('.t-email-validation-error').is(':visible'));
    this.$('.t-person-email').val('a@b.c').trigger('change');
    assert.ok(this.$('.t-email-validation-error').is(':hidden'));
});
