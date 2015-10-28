import random

from model_mommy import mommy

from category.models import Category
from utils.create import random_lorem


def create_categories():
    # Repair
    type = mommy.make(Category, name='repair',
        subcategory_label='trade')
    
    for i in range(random.randrange(2, 5)):
        name = random_lorem(1)
        trade = mommy.make(Category, name=name,
            subcategory_label='issue', parent=type)

    type.children.add(trade)
    type.save()

    for category in Category.objects.filter(subcategory_label='issue'):
        for i in range(random.randrange(2, 7)):
            name = random_lorem(2)
            mommy.make(Category, name=name,
                subcategory_label='sub_issue', parent=category)
