import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import TRANSLATION_DEFAULTS from 'bsrs-ember/vendor/defaults/translation';
import LOCALE_DEFAULTS from 'bsrs-ember/vendor/defaults/locale';
import LOCALE_FIXTURES from 'bsrs-ember/vendor/locale_fixtures';
import LOCALE_TRANSLATION_DEFAULTS from 'bsrs-ember/vendor/defaults/locale-translation';
import TRANSLATION_FIXTURES from 'bsrs-ember/vendor/admin_translation_fixtures';
import LocaleDeserializer from 'bsrs-ember/deserializers/locale';
import TranslationDeserializer from 'bsrs-ember/deserializers/translation';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, subject, subjectLocale;

module('unit: translation deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:locale', 'model:translation', 'model:translation-list', 'model:locale-translation']);
        subject = TranslationDeserializer.create({simpleStore: store});
        subjectLocale = LocaleDeserializer.create({simpleStore: store});
    }
});

test('_deserializeList - translations only created from list of strings', (assert) => {
    let json = ['home.welcome1', 'home.welcome2'];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    let translations = store.find('translation-list');
    assert.equal(translations.get('length'), 2);
    assert.equal(store.find('locales').get('length'), 0);
});

test('_deserializeList - if the object already exists in the store, do not replace it.', (assert) => {
    // NOTE: Confirm with Toran that this test is needed?
    // Translation doesn't have an properties to dirty, and the related 'locales' are 
    // computed, so re-pushing into the store doesn't affect the related 'locales' 
    // based on this test.
    let response = TRANSLATION_FIXTURES.get();
    subject.deserialize(response, TRANSLATION_DEFAULTS.keyOneGrid);
    let translation = store.find('translation', TRANSLATION_DEFAULTS.keyOneGrid);
    let locale = translation.get('locales').objectAt(0);
    let newTranslation = 'foo';

    locale.set('translation', newTranslation);
    assert.ok(locale.get('isDirty'));
    // 2nd `deserialize` will push 'translation' into store a 2nd time
    let json = [translation.get('id')];
    response = {'count':1,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    translation = store.push('translation', {id: TRANSLATION_DEFAULTS.keyOneGrid});
    locale = translation.get('locales').objectAt(0);
    assert.ok(locale.get('translation'), newTranslation);
    assert.ok(locale.get('isDirty'));
});

test('_deserializeSingle - translation', (assert) => {
    let response = TRANSLATION_FIXTURES.get();
    subject.deserialize(response, TRANSLATION_DEFAULTS.keyOneGrid);
    let translation = store.find('translation', TRANSLATION_DEFAULTS.keyOneGrid);
    assert.ok(translation);
    assert.equal(translation.get('id'), TRANSLATION_DEFAULTS.keyOneGrid);
    assert.equal(translation.get('key'), TRANSLATION_DEFAULTS.keyOneGrid);
});

test('_deserializeSingle - translation.locales attr is an array of "locale-translation" objects', (assert) => {
    let response = TRANSLATION_FIXTURES.get();
    // extra "locale-translation" in the "store" that should not be associated with the 
    // translation b/c the translation-key is different
    var model = {
        id: LOCALE_TRANSLATION_DEFAULTS.idOther,
        locale: LOCALE_TRANSLATION_DEFAULTS.localeOther,
        translation: LOCALE_TRANSLATION_DEFAULTS.translationOther
    };
    store.push('locale-translation', model);
    subject.deserialize(response, TRANSLATION_DEFAULTS.keyOneGrid);
    let translation = store.find('translation', TRANSLATION_DEFAULTS.keyOneGrid);
    assert.ok(translation);
    assert.equal(store.find('locale-translation').get('length'), 4);
    assert.equal(translation.get('locales').get('length'), 3);
    assert.equal(translation.get('locales').objectAt(0).get('id'), LOCALE_TRANSLATION_DEFAULTS.idOne);
});

test('_deserializeSingle - locale-translation - including locale_name', (assert) => {
    store.clear();
    // bootstrapped Locale
    let responseLocale = LOCALE_FIXTURES.get();
    subjectLocale.deserialize(responseLocale, LOCALE_DEFAULTS.idOne); // may need to change to match the "locale-translation"

    // Locale-Translation
    let response = TRANSLATION_FIXTURES.get();

    subject.deserialize(response, TRANSLATION_DEFAULTS.keyOneGrid);

    let locale = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.ok(locale);
    assert.equal(locale.get('id'), LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(locale.get('locale'), LOCALE_TRANSLATION_DEFAULTS.localeOne);
    assert.equal(locale.get('locale_name'), LOCALE_DEFAULTS.nameOne);
    assert.equal(locale.get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationOne);
});

test('_deserializeSingle - multiple deserializes from hitting detail endpoint would not affect state.', (assert) => {
    store.clear();
    let response = TRANSLATION_FIXTURES.get();

    // 1st `deserialize`
    subject.deserialize(response, TRANSLATION_DEFAULTS.keyOneGrid);
    let locale = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(locale.get('translation'), LOCALE_TRANSLATION_DEFAULTS.translationOne);
    let newTranslation = 'foo';
    locale.set('translation', newTranslation);
    assert.ok(locale.get('isDirty'));

    // 2nd `deserialize` where store push would happen again
    response = TRANSLATION_FIXTURES.get();
    subject.deserialize(response, TRANSLATION_DEFAULTS.keyOneGrid);
    locale = store.find('locale-translation', LOCALE_TRANSLATION_DEFAULTS.idOne);
    assert.equal(locale.get('translation'), newTranslation);
    assert.ok(locale.get('isDirty'));
});
