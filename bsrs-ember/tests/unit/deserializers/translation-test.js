import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import TRANSLATION_DEFAULTS from 'bsrs-ember/vendor/defaults/translation';
import LOCALE_TRANSLATION_DEFAULTS from 'bsrs-ember/vendor/defaults/locale-translation';
import TRANSLATION_FIXTURES from 'bsrs-ember/vendor/admin_translation_fixtures';
import TranslationDeserializer from 'bsrs-ember/deserializers/translation';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, subject;

module('unit: translation deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:translation', 'model:locale-translation']);
        subject = TranslationDeserializer.create({store: store});
    }
});

test('deserialize_single - translation', (assert) => {
    let response = TRANSLATION_FIXTURES.get();

    subject.deserialize(response, TRANSLATION_DEFAULTS.keyOneGrid);

    let ret = store.find('translation', TRANSLATION_DEFAULTS.keyOneGrid);
    assert.ok(ret);
    assert.equal(ret.get('id'), TRANSLATION_DEFAULTS.keyOneGrid);
    assert.equal(ret.get('key'), TRANSLATION_DEFAULTS.keyOneGrid);
});

test('deserialize_single - translation.locales attr is an array of "locale-translation" objects', (assert) => {
    let response = TRANSLATION_FIXTURES.get();
    // extra "locale-translation" in the "store" that should not be associated with the 
    // translation b/c the translation-key is different
    var model = {
        id: LOCALE_TRANSLATION_DEFAULTS.idOther,
        locale: LOCALE_TRANSLATION_DEFAULTS.localeOther,
        translation: LOCALE_TRANSLATION_DEFAULTS.translationOther
    };
    var locale_trans = store.push('locale-translation', model);
    subject.deserialize(response, TRANSLATION_DEFAULTS.keyOneGrid);

    let ret = store.find('translation', TRANSLATION_DEFAULTS.keyOneGrid);
    assert.ok(ret);
    assert.equal(store.find('locale-translation').get('length'), 4);
    assert.equal(ret.get('locales').get('length'), 3);
    assert.equal(ret.get('locales').objectAt(0).get('id'), LOCALE_TRANSLATION_DEFAULTS.idOne);
});

test('deserialize - list - translations only created from list of strings', (assert) => {
    let json = ['home.welcome1', 'home.welcome2'];
    let response = {'count':2,'next':null,'previous':null,'results': json};

    subject.deserialize(response);

    let translations = store.find('translation');
    assert.ok(translations.get('length'), 2);
    assert.equal(store.find('locales').get('length'), 0);
});

test('deserialize_single - locale-translation', (assert) => {
    store.clear();
    let response = TRANSLATION_FIXTURES.get();

    subject.deserialize(response, TRANSLATION_DEFAULTS.keyOne);

    let ret = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.ok(ret);
    assert.equal(ret.get('id'), LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(ret.get('locale'), LOCALE_TRANSLATION_DEFAULTS.localeOne);
    assert.equal(ret.get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationOne);
});
