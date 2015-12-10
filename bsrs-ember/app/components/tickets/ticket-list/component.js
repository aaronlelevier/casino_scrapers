import GridViewComponent from 'bsrs-ember/components/grid-view-2/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view-2',
    searchable: ['priority.translated_name', 'status.translated_name', 'created', 'location.name', 'assignee.fullname', 'category.name', 'request'],
    nonsearchable: ['number']
});
