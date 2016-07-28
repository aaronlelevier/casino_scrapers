import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: [
    {
      field: 'description',
      headerLabel: 'assignment.label.description',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    },
    {
      field: 'assignee.fullname',
      headerLabel: 'assignment.label.assignee',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true,
      classNames: ['assignment-assignee'],
      filterComponent: 'grid/filters/assignee-select-grid',
      powerSelect: true
    },
  ]
});
