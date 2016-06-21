import { columns } from 'bsrs-ember/components/tickets/ticket-list/component';
import GridViewComponent from 'bsrs-ember/components/grid-view/component';

/* jshint ignore:start */
var [priority, status, number, created, location, assignee, categories, request] = columns;
const newGridOrder = [categories, request, status, priority, location, assignee, created, number];

/*
* titleArrayProperty is the title's objects property accessed in template 
* metaArrayProperty is the meta's objects property accessed in template
*/
const searchResultConfig = {
  title: 'categories',
  titleArrayProperty: 'name',
  meta: 'location.name',
}

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: newGridOrder,
  searchResultConfig
});
/* jshint ignore:end */
