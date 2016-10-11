import {module as qunitModule, test} from 'bsrs-ember/tests/helpers/qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import localeConfig from 'ember-i18n/config/en';
import compiler from 'ember-i18n/utils/i18n/compile-template';

var module = function(name, settings){
    settings = settings || {};
    qunitModule(name, {
        beforeEach: function() {
            translation.initialize(this);
            const store = settings.beforeEach.apply(this, arguments);
            this.registry.register('util:i18n/compile-template', compiler);
            this.registry.register('config:environment', {i18n: {defaultLocale: 'en'}});
            this.registry.register('ember-i18n@config:en', localeConfig);
            let service = this.container.lookup('service:i18n');
            loadTranslations(service, translations.generate('en'));
            return store;
        },
        afterEach: function() {
            if(typeof settings.afterEach === 'function') {
                return settings.afterEach.apply(this, arguments);
            }
        }
    });
};

export { module, test };
