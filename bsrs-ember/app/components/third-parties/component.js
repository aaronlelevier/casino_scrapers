import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    columns: [
        {field: 'name', headerLabel: 'Name', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'status.name', headerLabel: 'Status', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'number', headerLabel: 'Number'}
    ]
});
