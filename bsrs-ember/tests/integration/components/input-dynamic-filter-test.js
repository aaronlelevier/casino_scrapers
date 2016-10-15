import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import fake from 'bsrs-ember/tests/helpers/fake';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

var FakeComponent = Ember.Object.extend({
    eventbus: Ember.inject.service(),
    init: function() {
        this.count = 0;
        this.get('eventbus').subscribe('bsrs-ember@component:input-dynamic-filter:', this, 'onValueUpdated');
    },
    onValueUpdated: function() {
        this.count = this.count + 1;
    },
    hits: function() {
        return this.count;
    }
});

var stub;

moduleForComponent('input-filter-dynamic', 'integration: input-filter-dynamic test', {
    integration: true,
    setup() {
        module_registry(this.container, this.registry, ['model:person', 'service:eventbus']);
        stub = fake.initialize(this.container, this.registry, 'components:fake', FakeComponent);
    }
});

test('input has a debouce that prevents each keystroke from publishing a message', function(assert) {
    var done = assert.async();
    var obj = Ember.Object.create({id: 1, name: ''});
    var prop = 'name';
    this.set('obj', obj);
    this.set('prop', prop);
    this.render(hbs`{{input-dynamic-filter prop=prop obj=obj}}`);
    assert.equal(this.$('.t-new-entry').val(), '');
    this.$('input:first').val('x').trigger('change');
    assert.equal(this.$('input:first').val(), 'x');
    assert.equal(stub.hits(), 0);
    setTimeout(function() {
        assert.equal(stub.hits(), 1);
        done();
    }, 100);
});

// test('input will pass along empty string value', function(assert) {
//     var done = assert.async();
//     var obj = Ember.Object.create({id: 1, name: 'x'});
//     var prop = 'name';
//     this.set('obj', obj);
//     this.set('prop', prop);
//     this.render(hbs`{{input-dynamic-filter prop=prop obj=obj}}`);
//     assert.equal(this.$('.t-new-entry').val(), 'x');
//     this.$('input:first').val('').trigger('change');
//     assert.equal(this.$('input:first').val(), '');
//     assert.equal(stub.hits(), 0);
//     setTimeout(function() {
//         assert.equal(stub.hits(), 0);
//         setTimeout(function() {
//             assert.equal(stub.hits(), 1);
//             done();
//         }, 50);//should be 11 sec but if test runner is slow, 11s will fail
//     }, 290);
// });
