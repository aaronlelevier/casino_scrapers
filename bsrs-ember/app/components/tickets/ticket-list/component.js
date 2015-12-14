import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    searchable: ['priority.translated_name', 'status.translated_name', 'created', 'location.name', 'assignee.fullname', 'categories[name]', 'request'],
    nonsearchable: ['number']
});
