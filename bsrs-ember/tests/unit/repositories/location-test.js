import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LocationRepository from 'bsrs-ember/repositories/location';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';

var store, original_xhr;

module('unit: location repository test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location']);
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

test('format_url will append key/value when provided', (assert) => {
    let subject = LocationRepository.create();
    let url_with_filter = subject.format_url({foo: 'bar'});
    assert.ok(url_with_filter.indexOf('?foo=bar') > -1);
    let url_without_filter = subject.format_url();
    assert.ok(url_without_filter.indexOf('?') === -1);
});

test('findTicket will format url correctly for search criteria and return correct location that are already present in store', (assert) => {
    store.push('location', {id: LOCATION_DEFAULTS.idOne, name: 'abc'});
    store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: 'abcd'});
    store.push('location', {id: LOCATION_DEFAULTS.unusedId, name: 'xyz'});
    store.push('location', {id: LOCATION_DEFAULTS.anotherId, name: 'mmm'});
    let subject = LocationRepository.create({store: store});
    let location_array_proxy = subject.findTicket('abc');
    assert.equal(location_array_proxy.get('length'), 2);
});

test('findTicket will lower case search', (assert) => {
    store.push('location', {id: LOCATION_DEFAULTS.idOne, name: 'abc'});
    store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: 'abcd'});
    store.push('location', {id: LOCATION_DEFAULTS.unusedId, name: 'xyz'});
    store.push('location', {id: LOCATION_DEFAULTS.anotherId, name: 'mmm'});
    let subject = LocationRepository.create({store: store});
    let location_array_proxy = subject.findTicket('Abc');
    assert.equal(location_array_proxy.get('length'), 2);
});

test('findTicket will return locations without a new flag', (assert) => {
    store.push('location', {id: LOCATION_DEFAULTS.idOne, name: 'abc', new: true});
    store.push('location', {id: LOCATION_DEFAULTS.idTwo, name: 'abcd'});
    store.push('location', {id: LOCATION_DEFAULTS.unusedId, name: 'xyz'});
    store.push('location', {id: LOCATION_DEFAULTS.anotherId, name: 'mmm'});
    let subject = LocationRepository.create({store: store});
    let location_array_proxy = subject.findTicket('Abc');
    assert.equal(location_array_proxy.get('length'), 1);
});
