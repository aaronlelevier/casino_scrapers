import {test, module} from 'bsrs-ember/tests/helpers/qunit';
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
    let now = new Date();
    assert.equal(now.toString(), 'Wed Dec 25 1991 13:12:59 GMT-0600 (CST)');
    let later = new Date();
    assert.deepEqual(now, later);
    timemachine.reset();
    let reboot = new Date();
    assert.notDeepEqual(now, reboot);
});
