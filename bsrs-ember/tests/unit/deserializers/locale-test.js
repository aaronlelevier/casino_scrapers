import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import LOCALE_DEFAULTS from 'bsrs-ember/vendor/defaults/locale';
import LocaleDeserializer from 'bsrs-ember/deserializers/locale';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, subject;

module('unit: locale deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:locale']);
        subject = LocaleDeserializer.create({simpleStore: store});
    }
});

test('_deserializeSingle - locale', (assert) => {
    let data = {
        id: LOCALE_DEFAULTS.idOne,
        native_name: LOCALE_DEFAULTS.native_nameOne,
        locale: LOCALE_DEFAULTS.localeOne,
        name: LOCALE_DEFAULTS.nameOne,
        presentation_name: LOCALE_DEFAULTS.presentation_nameOne,
        rtl: LOCALE_DEFAULTS.rtlOne
    };

    subject.deserialize(data, LOCALE_DEFAULTS.idOne);

    let locale = store.find('locale', LOCALE_DEFAULTS.idOne);
    assert.ok(locale);
    assert.equal(locale.get('id'), LOCALE_DEFAULTS.idOne);
    assert.equal(locale.get('native_name'), LOCALE_DEFAULTS.native_nameOne);
    assert.equal(locale.get('locale'), LOCALE_DEFAULTS.localeOne);
    assert.equal(locale.get('name'), LOCALE_DEFAULTS.nameOne);
    assert.equal(locale.get('presentation_name'), LOCALE_DEFAULTS.presentation_nameOne);
    assert.equal(locale.get('rtl'), LOCALE_DEFAULTS.rtlOne);
});
