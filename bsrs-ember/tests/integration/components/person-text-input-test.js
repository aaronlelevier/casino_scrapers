import Ember from 'ember';
const { run } = Ember;
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

var store, locale_repo, trans;
const ERR_TEXT = '.validated-input-error-dialog';

moduleForComponent('person-text-input', 'integration: person-text-input test', {
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
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'first_name';
  var done = assert.async();
  run(() => {
    this.set('model', store.push('person', {id: PD.id}));
  });
  this.render(hbs`{{people/person-text-input model=model field="first_name"}}`);
  // presence required
  let $err = this.$('.invalid');
  assert.equal($err.text().trim(), '');
  this.$('.t-person-first-name').val('').keyup();
  Ember.run.later(() => {
    let $err = this.$('.invalid');
    assert.ok($err.is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.person.first_name'));
    this.$('.t-person-first-name').val('a').keyup();
    Ember.run.later(() => {
      // valid input
      $err = this.$('.invalid');
      assert.notOk($err.is(':visible'));
      this.$('.t-person-first-name').val('a'.repeat(31)).keyup();
      Ember.run.later(() => {
        $err = this.$('.invalid');
        assert.ok($err.is(':visible'));
        assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.person.first_name.length'));
        this.$('.t-person-first-name').val('a'.repeat(30)).keyup();
        Ember.run.later(() => {
          $err = this.$('.invalid');
          assert.notOk($err.is(':visible'));
          done();
        }, 100);
      }, 1600);
    }, 100);
  }, 1600);
});

test('middle_initial validation error if not present or greater than 30 characters', function(assert) {
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'middle_initial';
  var done = assert.async();
  run(() => {
    this.set('model', store.push('person', {id: PD.id}));
  });
  this.render(hbs`{{people/person-text-input model=model field="middle_initial"}}`);
  // presence required
  let $err = this.$('.invalid');
  assert.equal($err.text().trim(), '');
  this.$('.t-person-middle-initial').val('').keyup();
  Ember.run.later(() => {
    let $err = this.$('.invalid');
    assert.notOk($err.is(':visible'));
    this.$('.t-person-middle-initial').val('a').keyup();
    Ember.run.later(() => {
      // valid input
      $err = this.$('.invalid');
      assert.notOk($err.is(':visible'));
      this.$('.t-person-middle-initial').val('1').keyup();
      Ember.run.later(() => {
        $err = this.$('.invalid');
        assert.ok($err.is(':visible'));
        assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.person.middle_initial'));
        done();
      }, 1600);
    }, 100);
  }, 1600);
});

test('last_name validation error if not present or greater than 30 characters', function(assert) {
  let modalDialogService = this.container.lookup('service:modal-dialog');
  modalDialogService.destinationElementId = 'last_name';
  var done = assert.async();
  run(() => {
    this.set('model', store.push('person', {id: PD.id}));
  });
  this.render(hbs`{{people/person-text-input model=model field="last_name"}}`);
  // presence required
  let $err = this.$('.invalid');
  assert.equal($err.text().trim(), '');
  this.$('.t-person-last-name').val('').keyup();
  Ember.run.later(() => {
    let $err = this.$('.invalid');
    assert.ok($err.is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.person.last_name'));
    this.$('.t-person-last-name').val('a').keyup();
    Ember.run.later(() => {
      // valid input
      $err = this.$('.invalid');
      assert.notOk($err.is(':visible'));
      this.$('.t-person-last-name').val('a'.repeat(31)).keyup();
      Ember.run.later(() => {
        $err = this.$('.invalid');
        assert.ok($err.is(':visible'));
        assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.person.last_name.length'));
        this.$('.t-person-last-name').val('a'.repeat(30)).keyup();
        Ember.run.later(() => {
          $err = this.$('.invalid');
          assert.notOk($err.is(':visible'));
          done();
        }, 100);
      }, 1600);
    }, 100);
  }, 1600);
});
