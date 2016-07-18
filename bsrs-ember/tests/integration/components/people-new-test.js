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

test('filling in invalid username reveal validation messages', function(assert) {
  run(() => {
    this.set('model', store.push('person', {}));
  });
  this.render(hbs`{{people/person-new model=model}}`);
  let $component = this.$('.has-error');
  assert.equal($component.text().trim(), '');
  this.$('.t-person-password').val(PD.password).trigger('change');
  var save_btn = this.$('.t-save-btn');
  save_btn.trigger('click').trigger('change');
  $component = this.$('.has-error');
  assert.ok($component.is(':visible'));
  assert.ok($component.text().trim().indexOf(trans.t('errors.person.username')) > -1);
});

test('should default locale if not present in Person model', function(assert) {
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
  assert.equal($component.text().trim(), trans.t(LD.nameOneKey));
  assert.ok(person.get('isNotDirty'));
  clickTrigger('.t-locale-select');
  nativeMouseUp(`.ember-power-select-option:contains(${PD.localeTwo})`);
  assert.equal($component.text().trim(), trans.t(LD.nameTwoKey));
});

test('first_name should raise validation error if first_name is blank becauase its required', function(assert) {
  var done = assert.async();
  run(() => {
    this.set('model', store.push('person', {id: PD.id}));
  });
  this.render(hbs`{{people/person-new model=model}}`);
  var $component = this.$('.t-first-name-validator .error');
  assert.equal($component.text().trim(), '');
  page.firstNameFill('');
  Ember.run.later(() => {
    const $component = this.$('.t-first-name-validator .error');
    assert.ok($component.is(':visible'));
    assert.equal($component.text().trim(), trans.t('errors.person.first_name'));
    done();
  }, 300);
});

test('filling in more than 1 char middle initial will reveal validation messages', function(assert) {
  var done = assert.async();
  run(() => {
    this.set('model', store.push('person', {id: PD.id}));
  });
  this.render(hbs`{{people/person-new model=model}}`);
  var $component = this.$('.t-middle-initial-validator .error');
  assert.equal($component.text().trim(), '');
  page.middleInitial('wa');
  Ember.run.later(() => {
    const $component = this.$('.t-middle-initial-validator .error');
    assert.ok($component.is(':visible'));
    assert.equal($component.text().trim(), trans.t('errors.person.middle_initial'));
    done();
  }, 300);
});

test('last_name should raise validation error if last_name is blank becauase its required', function(assert) {
  var done = assert.async();
  run(() => {
    this.set('model', store.push('person', {id: PD.id}));
  });
  this.render(hbs`{{people/person-new model=model}}`);
  var $component = this.$('.t-last-name-validator .error');
  assert.equal($component.text().trim(), '');
  page.lastNameFill('');
  Ember.run.later(() => {
    const $component = this.$('.t-last-name-validator .error');
    assert.ok($component.is(':visible'));
    assert.equal($component.text().trim(), trans.t('errors.person.last_name'));
    done();
  }, 300);
});

test('last_name should raise validation error if greater than 30 characters', function(assert) {
  var done = assert.async();
  run(() => {
    this.set('model', store.push('person', {id: PD.id}));
  });
  this.render(hbs`{{people/person-new model=model}}`);
  var $component = this.$('.t-last-name-validator .error');
  assert.equal($component.text().trim(), '');
  page.lastNameFill(Array(32).join('a'));
  Ember.run.later(() => {
    const $component = this.$('.t-last-name-validator .error');
    assert.ok($component.is(':visible'));
    assert.equal($component.text().trim(), trans.t('errors.person.last_name'));
    done();
  }, 300);
});

// test('filling in invalid password reveal validation messages', function(assert) {
//   run(() => {
//     this.set('model', store.push('person', {}));
//   });
//   this.render(hbs`{{people/person-new model=model}}`);
//   this.$('.t-person-username').val('a').trigger('change');
//   let $component = this.$('.has-error');
//   assert.equal($component.text().trim(), '');
//   var save_btn = this.$('.t-save-btn');
//   save_btn.trigger('click').trigger('change');
//   $component = this.$('.has-error');
//   assert.ok($component.is(':visible'));
//   assert.equal($component.text().trim(), trans.t('errors.person.password'));
// });
