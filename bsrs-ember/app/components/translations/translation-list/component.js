import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    columns: [
        {
            field: 'key',
            headerLabel: 'admin.translation.label.key',
            headerIsTranslatable: true,
            isSortable: true,
            isFilterable: true,
            isSearchable: true
        },
        {
            field: 'key',
            headerLabel: 'admin.translation.label.translation',
            headerIsTranslatable: true,
            isTranslatable: true
        }
    ]
});
