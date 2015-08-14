from model_mommy import mommy

from category.models import CategoryType, Category


def create_category_types():
    type = mommy.make(CategoryType, name='type')
    trade = mommy.make(CategoryType, name='trade', parent=type)
    issue = mommy.make(CategoryType, name='issue', parent=trade)

def create_categories():
    create_category_types()
    # CategoryTypes
    type = CategoryType.objects.get(name='type')
    trade = CategoryType.objects.get(name='trade')
    issue = CategoryType.objects.get(name='issue')

    [mommy.make(Category, type=type) for i in range(2)]
    # Trades
    for type in Category.objects.filter(type=type):
        for i in range(2):
            mommy.make(Category, type=trade, parent=type)
    # Issues
    for trade in Category.objects.filter(type=trade):
        for i in range(2):
            mommy.make(Category, type=issue, parent=trade)