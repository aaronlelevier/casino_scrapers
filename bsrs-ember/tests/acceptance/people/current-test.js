import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PEOPLE_DEFAULTS_PUT from 'bsrs-ember/vendor/defaults/person-put';
import PERSON_CURRENT_DEFAULTS from 'bsrs-ember/vendor/defaults/person-current';

const PREFIX = config.APP.NAMESPACE;
const PEOPLE_URL = '/admin/people';
const DETAIL_URL = PEOPLE_URL + '/' + PEOPLE_DEFAULTS.id;
const PERSON_CURRENT_URL = PEOPLE_URL + '/' + PERSON_CURRENT_DEFAULTS.id;

var application, store;

module('Acceptance | current user test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');

        var people_list_data = PEOPLE_FIXTURES.list();
        var current_person_data = PEOPLE_FIXTURES.detail(PERSON_CURRENT_DEFAULTS.id);

        var locale_data = translations.generate('es');
        var localeEndpoint = '/api/translations/?locale=es';

        var endpoint = PREFIX + PEOPLE_URL + '/';
        xhr(localeEndpoint, 'GET', null, {}, 200, locale_data);
        xhr(endpoint, 'GET', null, {}, 200, people_list_data);
        xhr(endpoint + PERSON_CURRENT_DEFAULTS.id + '/', 'GET', null, {}, 200, current_person_data);
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('when changing the locale for the current user, the language is updated on the site', (assert) => {
  visit(PERSON_CURRENT_URL);
  andThen(() => {

    assert.equal(currentURL(), PERSON_CURRENT_URL);
    var person = store.find('person', PERSON_CURRENT_DEFAULTS.id);

    assert.equal(person.get('id'), PERSON_CURRENT_DEFAULTS.id);

    assert.equal(find('.t-person-first-name').val(), PEOPLE_DEFAULTS.first_name);
    assert.equal(find('.t-locale-select option:selected').val(), PEOPLE_DEFAULTS.locale);
    assert.equal(find('.t-person-first-name').prop("placeholder"), "First Name");

    fillIn('.t-locale-select', PEOPLE_DEFAULTS.locale2);
    andThen(() => {
      assert.equal(find('.t-person-first-name').prop("placeholder"), "Nombre de pila");
    });
  });
});

test('when rolling back the locale the current locale is also changed back', (assert) => {
  visit(PERSON_CURRENT_URL);
  andThen(() => {

    assert.equal(currentURL(), PERSON_CURRENT_URL);
    var person = store.find('person', PERSON_CURRENT_DEFAULTS.id);

    assert.equal(person.get('id'), PERSON_CURRENT_DEFAULTS.id);

    assert.equal(find('.t-person-first-name').val(), PEOPLE_DEFAULTS.first_name);
    assert.equal(find('.t-locale-select option:selected').val(), PEOPLE_DEFAULTS.locale);
    assert.equal(find('.t-person-first-name').prop("placeholder"), "First Name");

    fillIn('.t-locale-select', PEOPLE_DEFAULTS.locale2);
    andThen(() => {
      assert.equal(find('.t-person-first-name').prop("placeholder"), "Nombre de pila");
    });

    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PERSON_CURRENT_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), PEOPLE_URL);
            assert.equal(find('.t-modal').is(':hidden'), true);
            var person = store.find('person', PERSON_CURRENT_DEFAULTS.id);
            assert.equal(person.get('locale'), PEOPLE_DEFAULTS.locale);
            assert.equal(find('.t-people').text(), "People");
        });
    });
  });
});
