import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: [
    {
      field: 'description',
      headerLabel: 'admin.automation.description',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    },
    {
      field: 'assignee.fullname',
      headerLabel: 'admin.automation.assignee',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true,
      classNames: ['automation-assignee'],
      filterComponent: 'grid/filters/assignee-select-grid',
      powerSelect: true
    },
  ]
});
