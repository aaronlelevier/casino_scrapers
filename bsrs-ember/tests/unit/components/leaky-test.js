import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import ParentValidationComponent from 'bsrs-ember/mixins/validation/parent';

var FirstComponent = ParentValidationComponent.extend({
    child_components: ['input-multi-phone', 'input-multi-address']
});

var LastComponent = ParentValidationComponent.extend({
    child_components: ['parent-ticket-category-select']
});

var store, eventbus;

module('unit: test to show leak or not a leak', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['service:eventbus']);
        eventbus = this.container.lookup('service:eventbus');
    }
});

test('each parent validation component will not leak state', (assert) => {
    let first = FirstComponent.create({eventbus: eventbus});
    assert.deepEqual(first.get('child_components').get('length'), 2);
    let last = LastComponent.create({eventbus: eventbus});
    assert.deepEqual(last.get('child_components').get('length'), 1);
    let again = FirstComponent.create({eventbus: eventbus});
    assert.deepEqual(again.get('child_components').get('length'), 2);
    assert.deepEqual(first.get('child_components').get('length'), 2);
    assert.deepEqual(last.get('child_components').get('length'), 1);
});
