import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import config from 'bsrs-ember/config/environment';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import PD_PUT from 'bsrs-ember/vendor/defaults/person-put';
import PCD from 'bsrs-ember/vendor/defaults/person-current';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import page from 'bsrs-ember/tests/pages/person';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_people_url;
const PEOPLE_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + PD.id;
const PERSON_CURRENT_URL = BASE_URL + '/' + PCD.id;

var application, store, list_xhr;

module('Acceptance | current user test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        var people_list_data = PF.list();
        var current_person_data = PF.detail(PCD.id);
        var locale_data_es = translations.generate('es');
        var locale_endpoint_es = '/api/translations/?locale=es';
        var endpoint = PREFIX + BASE_URL + '/';
        xhr(locale_endpoint_es, 'GET', null, {}, 200, locale_data_es);
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, people_list_data);
        xhr(endpoint + PCD.id + '/', 'GET', null, {}, 200, current_person_data);
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
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
    page.localeClickDropdown();
    page.localeClickOptionTwo();
    andThen(() => {
        assert.equal(find('.t-person-first-name').prop("placeholder"), "Nombre");
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
    page.localeClickDropdown();
    page.localeClickOptionTwo();
    andThen(() => {
        assert.equal(find('.t-person-first-name').prop("placeholder"), "Nombre");
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
            var person = store.find('person', PCD.id);
            assert.equal(person.get('locale').get('locale'), PD.locale);
            assert.equal(find('.t-grid-title').text(), "People");
        });
    });
});
