import {
  create,
  visitable,
  clickable
} from 'ember-cli-page-object';

export default create({
  visit: visitable('/'),
  clickDrawer: clickable('.t-nav-trigger')
});
