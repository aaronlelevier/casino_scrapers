import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    searchable: ['request', 'priority'],
    related_fields: [{'model': 'priority', 'field': 'name'}],
    nonsearchable: ['status']
});
