import GridViewComponent from 'bsrs-ember/components/grid-view-2/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view-2',
    searchable: ['created', 'request', 'location.name', 'priority.name', 'assignee.name', 'category.name'],
    nonsearchable: ['status']
});
