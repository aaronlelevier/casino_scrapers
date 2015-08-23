import Ember from 'ember';
import { module, test } from 'qunit';
import { Model } from 'ember-cli-simple-store/model';
import previous from 'bsrs-ember/utilities/previous';

var Batman;

module("previous attr unit tests", {
    setup: function() {
        Batman = Model.extend({
            some_fk: previous()
        });
    }
});

test("previous will return the last known value (starting undefined)", function(assert){
    var subject = Batman.create({id: 1, some_fk: undefined});
    assert.equal(undefined, subject.get("some_fk"));
    subject.set("some_fk", 7);
    assert.equal(7, subject.get('some_fk'));
    assert.equal(7, subject.get('_prevState.some_fk'));
    subject.set("some_fk", 9);
    assert.equal(9, subject.get("some_fk"));
    assert.equal(7, subject.get('_prevState.some_fk'));
});

test("previous will return the last known value (starting with legit value)", function(assert){
    var subject = Batman.create({id: 1, some_fk: 7});
    assert.equal(7, subject.get("some_fk"));
    subject.set("some_fk", 8);
    assert.equal(8, subject.get('some_fk'));
    assert.equal(8, subject.get('_prevState.some_fk'));
    subject.set("some_fk", 9);
    assert.equal(9, subject.get("some_fk"));
    assert.equal(8, subject.get('_prevState.some_fk'));
});
