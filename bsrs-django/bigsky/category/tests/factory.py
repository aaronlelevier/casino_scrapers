from model_mommy import mommy

from category.models import Category


def create_categories():

    # Parent Categories
    type = Category.objects.get(name='type')
    trade = Category.objects.get(name='trade')
    issue = Category.objects.get(name='issue')

    [mommy.make(Category, type=type) for i in range(2)]
    # Trades
    for type in Category.objects.filter(type=type):
        for i in range(2):
            mommy.make(Category, type=trade, parent=type)
    # Issues
    for trade in Category.objects.filter(type=trade):
        for i in range(2):
            mommy.make(Category, type=issue, parent=trade)