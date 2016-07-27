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
      field: 'assignee.username',
      headerLabel: 'assignment.label.assignee',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    },
    {
      field: 'pf.fukc',
      headerLabel: 'assignment.label.pf',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    }
  ]
});
