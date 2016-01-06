import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';

var store, run = Ember.run;

moduleForComponent('person-new', 'integration: person-new test', {
    integration: true,
    setup() {
        store = module_registry(this.container, this.registry, ['model:person', 'model:role']);
        translation.initialize(this);
        var service = this.container.lookup('service:i18n');
        var json = translations.generate('en');
        loadTranslations(service, json);
    }
});

test('filling in invalid username reveal validation messages', function(assert) {
    run(() => {
        this.set('model', store.push('person', {}));
    });
    this.render(hbs`{{person-new model=model}}`);
    var $component = this.$('.t-username-validation-error');
    assert.ok($component.is(':hidden'));
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok($component.is(':visible'));
    this.$('.t-person-username').val('a').trigger('change');
    assert.ok($component.is(':hidden'));
});

test('filling in invalid password reveal validation messages', function(assert) {
    run(() => {
        this.set('model', store.push('person', {}));
    });
    this.render(hbs`{{person-new model=model}}`);
    var $component = this.$('.t-password-validation-error');
    assert.ok($component);
    var save_btn = this.$('.t-save-btn');
    save_btn.trigger('click').trigger('change');
    assert.ok($component.is(':visible'));
    this.$('.t-person-password').val('a').trigger('change');
    assert.ok($component.is(':hidden'));
});

