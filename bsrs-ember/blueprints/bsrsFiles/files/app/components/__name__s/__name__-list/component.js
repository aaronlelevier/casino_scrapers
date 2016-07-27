import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: [
    {
      field: '<%= firstProperty %>',
      headerLabel: '<%= dasherizedModuleName %>.label.<%= firstProperty %>',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    },
    {
      field: '<%= secondProperty %>.<%= secondModelDisplaySnake %>',
      headerLabel: '<%= dasherizedModuleName %>.label.<%= secondProperty %>',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    },
    {
      field: '<%= thirdProperty %>.<%= thirdAssociatedModelDisplaySnake %>',
      headerLabel: '<%= dasherizedModuleName %>.label.<%= thirdProperty %>',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    }
  ]
});
