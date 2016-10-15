import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import LOCALE_TRANSLATION_DEFAULTS from 'bsrs-ember/vendor/defaults/locale-translation';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, ret, locale_trans, run = Ember.run;

module('unit: locale-translation', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:translation', 'model:locale-translation']);
        var locale_trans = {
            id: LOCALE_TRANSLATION_DEFAULTS.idOne,
            locale: LOCALE_TRANSLATION_DEFAULTS.localeOne,
            translation: LOCALE_TRANSLATION_DEFAULTS.translationOne
        };
        run(function() {
            store.push('locale-translation', locale_trans);
        });
    }
});

test('translation_key - computed property that returns the "translation key" of the related "translation"', (assert) => {
    locale_trans = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idOne);
    ret = locale_trans.get('translation_key');
    assert.equal(ret, locale_trans.get('id').split(":")[1]);
});

test('translation_key - computed property that returns an empty "translation key" if one doesnt exist', (assert) => {
    locale_trans = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idOne);
    locale_trans.set('id', 'fooblah');
    ret = locale_trans.get('translation_key');
    assert.equal(ret, '');
});
