import GridViewComponent from 'bsrs-ember/components/grid-view-2/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view-2',
    searchable: ['name', 'status'],
    related_fields: [{'model': 'status', 'field': 'name'}],
    nonsearchable: ['number']
});
