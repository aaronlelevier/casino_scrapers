import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import TAB_DEFAULTS from 'bsrs-ember/vendor/defaults/tab';
import TAB_FIXTURES from 'bsrs-ember/vendor/tab_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, tab1, tab2, run = Ember.run;

module('unit: tab', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:tab']);
    }
});

test('test generic attrs on the model', (assert) => {
    let data = TAB_FIXTURES.get();
    tab1 = store.push('tab', data);
    assert.equal(tab1.get('id'), TAB_DEFAULTS.id_one);
    assert.equal(tab1.get('doc_type'), TAB_DEFAULTS.doc_type_one);
    assert.equal(tab1.get('doc_route'), TAB_DEFAULTS.doc_route_one);
    assert.equal(tab1.get('templateModelField'), TAB_DEFAULTS.templateModelField_one);
    assert.equal(tab1.get('redirect'), TAB_DEFAULTS.redirect_one);
    assert.equal(tab1.get('newModel'), TAB_DEFAULTS.newModel_one);
});
test('amk ensure tabs are aware of the total tab count', (assert) => {
    let data = TAB_FIXTURES.get();
    run(()=>{
        tab1 = store.push('tab', data);
    });
    assert.equal(tab1.get('tab_count').get('length'), 1);

    data = TAB_FIXTURES.get(TAB_DEFAULTS.id_two);
    run(()=>{
        tab2 = store.push('tab', data);
    });
    assert.equal(tab1.get('tab_count').get('length'), 2);
    assert.equal(tab2.get('tab_count').get('length'), 2);





    //assert.equal(tab1.get('tab_width'), '180px');

    // Make sure we have 8 tabs in the store
    // assert.equal(tab8.get('tab_count'), 8);
    // Make sure the original width has been altered
    // assert.notEqual(original_w, tab1.get('tab_width'));
    // Make sure the first tab and the last tab have the same width
    // assert.equal(tab1.get('tab_width'), tab8.get('tab_width'));

});
