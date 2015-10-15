import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PeopleRepository from 'bsrs-ember/repositories/person';
import PersonDeserializer from 'bsrs-ember/deserializers/person';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

var store, original_xhr;

module('unit: person repository test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person']);
        original_xhr = PromiseMixin.xhr;
        PromiseMixin.xhr = function() {
            return {
                then() {}
            };
        };
    },
    afterEach() {
        PromiseMixin.xhr = original_xhr;
    }
});

test('findTicketPeople will format url correctly for search criteria and return correct people that are already present in store', (assert) => {
    store.push('person', {id: PEOPLE_DEFAULTS.idOne, fullname: 'abc'});
    store.push('person', {id: PEOPLE_DEFAULTS.idTwo, fullname: 'abcd'});
    store.push('person', {id: PEOPLE_DEFAULTS.unusedId, fullname: 'xyz'});
    store.push('person', {id: PEOPLE_DEFAULTS.anotherId, fullname: 'mmm'});
    let subject = PeopleRepository.create({store: store});
    let people_array_proxy = subject.findTicketPeople('abc');
    assert.equal(people_array_proxy.get('length'), 2);
});
