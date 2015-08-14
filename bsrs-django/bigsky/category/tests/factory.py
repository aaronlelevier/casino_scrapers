from model_mommy import mommy

from category.models import CategoryType, Category


def create_category_types():
    type = mommy.make(CategoryType, name='type')
    trade = mommy.make(CategoryType, name='trade', parent=type)
    issue = mommy.make(CategoryType, name='issue', parent=trade)

def create_categories():
    create_category_types()

    [mommy.make(Category, type=self.type) for i in range(2)]
    # Trades
    for type in Category.objects.filter(type=self.type):
        for i in range(2):
            mommy.make(Category, type=self.trade, parent=type)
    # Issues
    for trade in Category.objects.filter(type=self.trade):
        for i in range(2):
            mommy.make(Category, type=self.issue, parent=trade)