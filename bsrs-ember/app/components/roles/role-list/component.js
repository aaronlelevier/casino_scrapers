import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: [
    {
      field: 'name', 
      classNames: ['role-name'],
      headerLabel: 'admin.role.label.name', 
      headerIsTranslatable: true, 
      isSortable: true, 
      isFilterable: true, 
      isSearchable: true
    },
    {
      field: 'role_type', 
      classNames: ['role-type'],
      headerLabel: 'admin.role.label.role_type', 
      headerIsTranslatable: true, 
      isSortable: true, 
      isFilterable: true, 
      isSearchable: true,
      isTranslatable: true,
      filterComponent: 'grid/filters/checkbox-list',
      filterModelName: 'role-type',
    },
    {
      field: 'location_level', 
      headerLabel: 'admin.role.label.location_level', 
      headerIsTranslatable: true
    }
  ]
});
