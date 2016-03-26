import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    columns: [
        {field: 'name', headerLabel: 'admin.role.label.name', headerIsTranslatable: true, isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'role_type', headerLabel: 'admin.role.label.role_type', headerIsTranslatable: true, isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'location_level', headerLabel: 'admin.role.label.location_level', headerIsTranslatable: true}
    ]
});
