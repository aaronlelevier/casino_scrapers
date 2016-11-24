import getCookie from 'bsrs-ember/utilities/get-cookie';
import { module, test } from 'qunit';

module('Unit | Utility | get cookie');

test('extracts a cookie by name, e.g. csrftoken', function(assert) {
  let mockCookie = 'csrftoken=4wkyPzErvJ';
  let csrftoken = getCookie('csrftoken', mockCookie /*default is document.cookie*/);
  assert.equal(csrftoken, '4wkyPzErvJ', 'found only cookie key');

  mockCookie = 'csrftoken=4wkyPzErvJ; othercookie=blah';
  csrftoken = getCookie('csrftoken', mockCookie);
  assert.equal(csrftoken, '4wkyPzErvJ', 'found as first key in cookies');

  mockCookie = 'othercookie=blah; csrftoken=4wkyPzErvJ';
  csrftoken = getCookie('csrftoken', mockCookie);
  assert.equal(csrftoken, '4wkyPzErvJ', 'found as last key in cookies');

  mockCookie = 'othercookie=blah; csrftoken=4wkyPzErvJ ;yetanother=booyah';
  csrftoken = getCookie('csrftoken', mockCookie);
  assert.equal(csrftoken, '4wkyPzErvJ', 'found as middle key in cookies');
});
