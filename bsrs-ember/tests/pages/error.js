import {
  create,
  visitable,
  text
} from 'ember-cli-page-object';

export default create({
  errorText: text('[data-test-id="main-route-error"]'),
  adminErrorText: text('[data-test-id="admin-route-error"]'),
});
