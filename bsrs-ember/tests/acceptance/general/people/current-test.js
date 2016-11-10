import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import config from 'bsrs-ember/config/environment';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import PD_PUT from 'bsrs-ember/vendor/defaults/person-put';
import PCD from 'bsrs-ember/vendor/defaults/person-current';
import page from 'bsrs-ember/tests/pages/person';
import BASEURLS, { PEOPLE_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_people_url;
const PEOPLE_INDEX_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + PD.id;
const PERSON_CURRENT_URL = BASE_URL + '/' + PCD.id;

var store, list_xhr;

moduleForAcceptance('Acceptance | general person current test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    var people_list_data = PF.list();
    var current_person_data = PF.detail(PCD.id);
    var locale_data_es = translations.generate('es');
    var locale_endpoint_es = '/api/translations/?locale=es&timezone=America/Los_Angeles';
    xhr(locale_endpoint_es, 'GET', null, {}, 200, locale_data_es);
    list_xhr = xhr(PEOPLE_URL + '?page=1', 'GET', null, {}, 200, people_list_data);
    xhr(PEOPLE_URL + PCD.id + '/', 'GET', null, {}, 200, current_person_data);
  },
});

test('when changing the locale for the current user, the language is updated on the site', (assert) => {
  clearxhr(list_xhr);
  visit(PERSON_CURRENT_URL);
  andThen(() => {
    assert.equal(currentURL(), PERSON_CURRENT_URL);
    var person = store.find('person', PCD.id);
    assert.equal(person.get('id'), PCD.id);
    assert.equal(find('.t-person-first-name').val(), PD.first_name);
    assert.equal(find('.t-person-first-name').prop("placeholder"), "First Name");
  });
  selectChoose('.t-locale-select', PD.localeTwo);
  andThen(() => {
    assert.equal(find('.t-person-first-name').prop("placeholder"), "Nombre de pila");
  });
});

test('when rolling back the locale the current locale is also changed back', (assert) => {
  visit(PERSON_CURRENT_URL);
  andThen(() => {
    assert.equal(currentURL(), PERSON_CURRENT_URL);
    var person = store.find('person', PCD.id);
    assert.equal(person.get('id'), PCD.id);
    assert.equal(find('.t-person-first-name').val(), PD.first_name);
    assert.equal(find('.t-person-first-name').prop("placeholder"), "First Name");
  });
  selectChoose('.t-locale-select', PD.localeTwo);
  andThen(() => {
    assert.equal(find('.t-person-first-name').prop("placeholder"), "Nombre de pila");
  });
  click('.t-cancel-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), PERSON_CURRENT_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  click('.t-modal-footer .t-modal-rollback-btn');
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), PEOPLE_INDEX_URL);
      var person = store.find('person', PCD.id);
      assert.equal(person.get('locale').get('locale'), PD.locale);
      assert.equal(find('.t-grid-title').text(), "People");
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});
