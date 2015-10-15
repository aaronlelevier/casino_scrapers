import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import config from 'bsrs-ember/config/environment';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PeopleRepository from 'bsrs-ember/repositories/person';
import PersonDeserializer from 'bsrs-ember/deserializers/person';
import LocationDeserializer from 'bsrs-ember/deserializers/location';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import repository from 'bsrs-ember/tests/helpers/repository';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_people_url;

var store, endpoint, person_deserializer, uuid, location_level_deserializer, location_deserializer, person_repo;

module('unit: person repository test', {
    beforeEach() {
        uuid = this.container.lookup('model:uuid');
        store = module_registry(this.container, this.registry, ['model:random','model:uuid','model:person', 'model:role','model:person-location','model:location','model:location-level','model:phonenumber','model:address','model:address-type','service:person-current','service:translations-fetcher','service:i18n']);
        endpoint = '/api' + BASE_URL + '/' + '?fullname__icontains=abc';
        xhr(endpoint, 'GET', null, {}, 200, {});
        location_level_deserializer = LocationLevelDeserializer.create({store: store});
        location_deserializer = LocationDeserializer.create({store: store, LocationLevelDeserializer: location_level_deserializer});
        person_deserializer = PersonDeserializer.create({store: store, uuid: uuid, LocationDeserializer: location_deserializer});
    }
});

test('sco findTicketPeople will format url correctly for search criteria and return correct people', (assert) => {
    store.push('person', {id: PEOPLE_DEFAULTS.idOne, fullname: 'abc'});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo, fullname: 'abcd'});
    store.push('person', {id: PEOPLE_DEFAULTS.unusedId, fullname: 'xyz'});
    store.push('person', {id: PEOPLE_DEFAULTS.anotherId, fullname: 'mmm'});
    let subject = PeopleRepository.create({store: store, PersonDeserializer: person_deserializer});
    let people_array_proxy = subject.findTicketPeople('abc');
    assert.equal(people_array_proxy.get('length'), 2);
});

