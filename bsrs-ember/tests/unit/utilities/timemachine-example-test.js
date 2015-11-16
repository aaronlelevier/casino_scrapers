import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import moment from 'moment';
import timemachine from 'vendor/timemachine';

module('unit: timemachine example test', {
    beforeEach() {
        timemachine.config({
            dateString: 'December 25, 1991 13:12:59'
        });
    },
    afterEach() {
        timemachine.reset();
    }
});

test('should freeze time to assert specific date formatting', (assert) => {
    let expected = 'December 25th 1991, 1:12:59 pm';
    let now = new Date();
    assert.equal(moment(new Date()).format('MMMM Do YYYY, h:mm:ss a'), expected);
    let later = new Date();
    assert.deepEqual(now, later);
    timemachine.reset();
    let reboot = new Date();
    assert.notDeepEqual(now, reboot);
});
