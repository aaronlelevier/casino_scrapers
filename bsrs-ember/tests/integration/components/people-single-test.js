import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';

var store;

moduleForComponent('person-single', 'integration: person-single test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:role', 'model:currency']);
        translation.initialize(this);
        var service = this.container.lookup('service:i18n');
        var json = translations.generate('en');
        loadTranslations(service, json);
        store.push('currency', CURRENCY_DEFAULTS);
    }
});

test('filling in invalid username reveal validation messages', function(assert) {
    this.set('model', store.push('person', {}));
    this.render(hbs`{{person-single model=model}}`);
    var $component = this.$('.t-username-validation-error');
    assert.ok($component.is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok($component.is(':visible'));
    this.$('.t-person-username').val('a').trigger('change');
    assert.ok($component.is(':hidden'));
});

test('filling in valid one char middle initial will not reveal validation messages', function(assert) {
    this.set('model', store.push('person', {}));
    this.render(hbs`{{person-single model=model}}`);
    var $component = this.$('.t-middle-initial-validation-error');
    assert.ok($component.is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok($component.is(':hidden'));
    this.$('.t-person-middle-initial').val('a').trigger('change');
    assert.ok($component.is(':hidden'));
});

test('filling in invalid one char middle initial will reveal validation messages', function(assert) {
    this.set('model', store.push('person', {}));
    this.render(hbs`{{person-single model=model}}`);
    var $component = this.$('.t-middle-initial-validation-error');
    assert.ok($component.is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok($component.is(':hidden'));
    this.$('.t-person-middle-initial').val('ab').trigger('change');
    assert.ok($component.is(':visible'));
});
