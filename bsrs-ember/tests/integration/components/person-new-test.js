import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import { clickTrigger, nativeMouseUp } from 'bsrs-ember/tests/helpers/ember-power-select';
import repository from 'bsrs-ember/tests/helpers/repository';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import LD from 'bsrs-ember/vendor/defaults/locale';
import page from 'bsrs-ember/tests/pages/person';
import general from 'bsrs-ember/tests/pages/general';

var store, run = Ember.run, locale_repo, trans;
const PD = PERSON_DEFAULTS.defaults();

moduleForComponent('person-new', 'integration: person-new test', {
  integration: true,
  setup() {
    page.setContext(this);
    general.setContext(this);
    store = module_registry(this.container, this.registry, ['model:person']);
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
    var service = this.container.lookup('service:i18n');
    var json = translations.generate('en');
    loadTranslations(service, json);
    run(function() {
      store.push('locale', {id: LD.idOne, name: LD.nameOneKey, default: LD.defaultOne});
      store.push('locale', {id: LD.idTwo, name: LD.nameTwoKey});
    });
    locale_repo = repository.initialize(this.container, this.registry, 'locale');
    locale_repo.get_default = () => { return store.find('locale', {default:true}).objectAt(0); };
  },
  afterEach() {
    page.removeContext(this);
    general.removeContext(this);
  }
});

test('locale should default if not present in Person model', function(assert) {
  let person;
  run(() => {
    person = store.push('person', {});
    person.changeLocale = function(){};
    this.set('model', person);
  });
  let locales = store.find('locale');
  this.set('locales', locales);
  this.render(hbs`{{people/person-new model=model locales=locales}}`);
  let $component = this.$('.t-locale-select');
  assert.equal($component.text().trim(), trans.t(LD.defaultPlaceholder));
  assert.ok(person.get('isNotDirty'));
  clickTrigger('.t-locale-select');
  nativeMouseUp(`.ember-power-select-option:contains(${PD.localeTwo})`);
  assert.equal(page.localeInput.replace(/\W+/, ''), trans.t(PD.localeTwo));
  assert.equal(Ember.$('[data-test-id="locale"] > label > span').text().trim(), trans.t('optional'));
});

test('middle initial should have a maxlength of 1', function(assert) {
  this.render(hbs`{{people/person-new model=model locales=locales}}`);
  assert.equal(this.$('.t-person-middle-initial').attr('maxlength'), 1);
});
