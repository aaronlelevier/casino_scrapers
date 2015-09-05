import { test, module } from 'qunit';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { attr, Model } from 'ember-cli-simple-store/model';

var TestDouble = Model.extend(NewMixin, {
    name: attr()
});

module('new mixin unit test');

test('new will return true until the model is saved', function(assert) {
    let subject = TestDouble.create({name: undefined, new: true});
    assert.ok(subject.get('new'));
    subject.save();
    assert.ok(!subject.get('new'));
});

// test('isNewAndNotDirty will return a sum of both new and isNotDirty', function(assert) {
//     let subject = TestDouble.create({name: undefined, new: true});
//     assert.equal(subject.get('new'), true);
//     assert.equal(subject.get('isNotDirty'), true);
//     assert.equal(subject.get('isNewAndNotDirty'), true);
//     subject.set('name', 'x');
//     assert.equal(subject.get('new'), true);
//     assert.equal(subject.get('isNotDirty'), false);
//     assert.equal(subject.get('isNewAndNotDirty'), false);
//     subject.save();
//     assert.equal(subject.get('new'), undefined);
//     assert.equal(subject.get('isNotDirty'), true);
//     assert.equal(subject.get('isNewAndNotDirty'), undefined);
// });
