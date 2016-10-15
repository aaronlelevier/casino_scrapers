import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var store;

module('unit: current-user test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:person','model:person-current','service:person-current','service:translations-fetcher','service:i18n']);
    }
});

test('current user is displayed', (assert) => {
    let relatedSubject = store.push('person', { id: 1 });
    let subject = store.push('person-current', { id: 1 });
    assert.equal(subject.get('person.fullname'), 'undefined undefined');
    relatedSubject.set('first_name', 'Big');
    relatedSubject.set('last_name', 'Lebowsky');
    assert.equal(subject.get('person.fullname'), 'Big Lebowsky');
});
