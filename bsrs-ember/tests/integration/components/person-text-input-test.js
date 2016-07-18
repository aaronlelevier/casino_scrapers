import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from "bsrs-ember/vendor/translation_fixtures";
import GLOBAL from 'bsrs-ember/vendor/defaults/global-message';
import { typeInSearch, clickTrigger, nativeMouseUp } from 'bsrs-ember/tests/helpers/ember-power-select';
import repository from 'bsrs-ember/tests/helpers/repository';
import PD from 'bsrs-ember/vendor/defaults/person';
import RD from 'bsrs-ember/vendor/defaults/role';
import LD from 'bsrs-ember/vendor/defaults/locale';
import page from 'bsrs-ember/tests/pages/person';

var store, run = Ember.run, locale_repo, trans;

moduleForComponent('person-new', 'integration: person-new test', {
  integration: true,
  setup() {
    page.setContext(this);
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
  }
});

test('first_name validation error if not present or greater than 30 characters', function(assert) {
  run(() => {
    this.set('model', store.push('person', {id: PD.id}));
  });
  this.render(hbs`{{people/person-text-input model=model field="first_name"}}`);
  let $component = this.$('.t-first-name-validator .error');
  // presence required
  assert.equal($component.text().trim(), '');
  page.firstNameFill('');
  let $err = this.$('.t-first-name-validator .error');
  assert.ok($err.is(':visible'));
  assert.equal($err.text().trim(), trans.t('errors.person.first_name'));
  // valid input
  $err = this.$('.t-first-name-validator .error');
  page.firstNameFill('a');
  assert.notOk($err.is(':visible'));
  // length validation
  page.firstNameFill(Array(32).join('a'));
  $err = this.$('.t-first-name-validator .error');
  assert.ok($err.is(':visible'));
  assert.equal($err.text().trim(), trans.t('errors.person.first_name'));
});

test('middle_initial validation error if more than 1 character', function(assert) {
  run(() => {
    this.set('model', store.push('person', {id: PD.id}));
  });
  this.render(hbs`{{people/person-text-input model=model field="middle_initial"}}`);
  var $component = this.$('.t-middle-initial-validator .error');
  assert.equal($component.text().trim(), '');
  // invalid
  page.middleInitial('wa');
  let $err = this.$('.t-middle-initial-validator .error');
  assert.ok($err.is(':visible'));
  assert.equal($err.text().trim(), trans.t('errors.person.middle_initial'));
  // valid - if 1 char
  page.middleInitial('a');
  $err = this.$('.t-middle-initial-validator .error');
  assert.notOk($err.is(':visible'));
  // valid - b/c not a required field
  page.middleInitial('');
  $err = this.$('.t-middle-initial-validator .error');
  assert.notOk($err.is(':visible'));
});

test('last_name validation error if not present or greater than 30 characters', function(assert) {
  run(() => {
    this.set('model', store.push('person', {id: PD.id}));
  });
  this.render(hbs`{{people/person-text-input model=model field="last_name"}}`);
  var $component = this.$('.t-last-name-validator .error');
  assert.equal($component.text().trim(), '');
  // invalid b/c required
  page.lastNameFill('');
  let $err = this.$('.t-last-name-validator .error');
  assert.ok($err.is(':visible'));
  assert.equal($err.text().trim(), trans.t('errors.person.last_name'));
  // valid
  page.lastNameFill('a');
  $err = this.$('.t-last-name-validator .error');
  assert.notOk($err.is(':visible'));
  // invalid length
  page.lastNameFill(Array(32).join('a'));
  $err = this.$('.t-last-name-validator .error');
  assert.ok($err.is(':visible'));
  assert.equal($err.text().trim(), trans.t('errors.person.last_name'));
});
