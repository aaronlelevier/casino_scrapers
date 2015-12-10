import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import localeConfig from 'ember-i18n/config/en';
import compiler from 'ember-i18n/utils/i18n/compile-template';

var store;

module('unit: model translation test', {
    beforeEach() {
        translation.initialize(this);
        store = module_registry(this.container, this.registry, ['model:category', 'model:ticket-priority', 'model:ticket-status', 'service:i18n']);
        this.registry.register('util:i18n/compile-template', compiler);
        this.registry.register('config:environment', {i18n: {defaultLocale: 'en'}});
        this.registry.register('ember-i18n@config:en', localeConfig);
        let service = this.container.lookup('service:i18n');
        loadTranslations(service, translations.generate('en'));
    }
});

test('category translated name returns correct value', (assert) => {
    let category = store.push('category', {id: 1, name: ''});
    assert.equal(category.get('translated_name'), '');
    category.set('name', 'admin.category.name.repair');
    assert.equal(category.get('translated_name'), 'Repair');
});

test('ticket-priority translated name returns correct value', (assert) => {
    let priority = store.push('ticket-priority', {id: 1, name: ''});
    assert.equal(priority.get('translated_name'), '');
    priority.set('name', 'ticket.priority.high');
    assert.equal(priority.get('translated_name'), 'High');
});

test('ticket-status translated name returns correct value', (assert) => {
    let status = store.push('ticket-status', {id: 1, name: ''});
    assert.equal(status.get('translated_name'), '');
    status.set('name', 'ticket.status.draft');
    assert.equal(status.get('translated_name'), 'Draft');
});
