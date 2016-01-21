import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    version: 'vNext', //TODO: remove this after the grid-view upgrade is complete
    columns: [
        {field: 'name', headerLabel: 'Role Name', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'role_type', headerLabel: 'Role Type', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'location_level', headerLabel: 'Location Organization'}
    ]
});
