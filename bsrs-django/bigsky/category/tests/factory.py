import random

from model_mommy import mommy

from category.models import Category
from utils.create import random_lorem


def create_categories(_many=0):
    # Repair
    type = mommy.make(Category, name='repair',
        subcategory_label='trade')
     
    num_of_cat = random.randrange(2,5)
    if _many > 0:
        num_of_cat = _many

    for i in range(0, num_of_cat):
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
