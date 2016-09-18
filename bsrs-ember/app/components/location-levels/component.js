import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: [
    {
      field: 'name', 
      headerLabel: 'admin.locationlevel.label.name', 
      headerIsTranslatable: true, 
      isSortable: true, 
      isFilterable: true, 
      isSearchable: true
    }
  ]
});
