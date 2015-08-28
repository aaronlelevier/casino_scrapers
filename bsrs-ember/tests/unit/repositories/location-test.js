import Ember from 'ember';
import {test, module} from 'qunit';
import LocationRepository from 'bsrs-ember/repositories/location';

module('unit: location repository test');

test('format_url will append key/value when provided', (assert) => {
    let subject = LocationRepository.create();
    let url_with_filter = subject.format_url({foo: 'bar'});
    assert.ok(url_with_filter.indexOf('?foo=bar') > -1);
    let url_without_filter = subject.format_url();
    assert.ok(url_without_filter.indexOf('?') === -1);
});
