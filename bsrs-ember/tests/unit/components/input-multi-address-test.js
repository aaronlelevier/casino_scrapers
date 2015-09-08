import Ember from 'ember';
import {test, module} from 'qunit';
import repository from 'bsrs-ember/tests/helpers/repository';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import InputMultiAddressComponent from 'bsrs-ember/components/input-multi-address/component';
import AddressType from 'bsrs-ember/models/address-type';
import ADDRESS_TYPE_DEFAULTS from 'bsrs-ember/vendor/defaults/address-type';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';

var registry, container, store, eventbus, run = Ember.run;

module('unit: input-multi-address component test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:person', 'model:address', 'service:eventbus']);
        eventbus = container.lookup('service:eventbus');
    },
    afterEach() {
        eventbus = null;
        store = null;
        container = null;
        registry = null;
    }
});

test('valid computed should ignore models with an empty or undefined address attr (starting with no bound models)', (assert) => {
    let address;
    let person = store.push('person', {id: PEOPLE_DEFAULTS.id});
    let address_types = [AddressType.create({ id: ADDRESS_TYPE_DEFAULTS.officeId, name: ADDRESS_TYPE_DEFAULTS.officeName }), AddressType.create({ id: ADDRESS_TYPE_DEFAULTS.shippingId, name: ADDRESS_TYPE_DEFAULTS.shippingName })];
    let model = store.find('address', {person: PEOPLE_DEFAULTS.id});
    let subject = InputMultiAddressComponent.create({model: model, eventbus: eventbus});
    assert.equal(subject.get('valid'), true);
    run(() => {
        address = model.push({id: 'def456', type: ADDRESS_TYPE_DEFAULTS.officeId, person: PEOPLE_DEFAULTS.id});
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        address.set('address', '1');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        address.set('address', '123 Sky Park Ct. #45');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        address.set('address', 'Sky Park ~');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), false);
    run(() => {
        address.set('address', '');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
    run(() => {
        address.set('address', ' ');
        subject.notifyPropertyChange('valid');
    });
    assert.equal(subject.get('valid'), true);
});
