import random

from model_mommy import mommy

from category.models import Category, CATEGORY_STATUSES, CategoryStatus
from utils.create import random_lorem
from utils.helpers import generate_uuid


def create_categories(_many=None):
    create_category_statuses()
    # Repair
    type = mommy.make(Category, name='repair',
        subcategory_label='trade', status=random.choice(CategoryStatus.objects.all()))
    
    if _many:
        num_of_cat = _many
    else:
        num_of_cat = random.randrange(2,5)

    for i in range(0, num_of_cat):
        name = random_lorem(1)
        status = random.choice(CategoryStatus.objects.all())
        issue = mommy.make(Category, name=name,
            subcategory_label='issue', parent=type, status=status)

    type.children.add(issue)

    for category in Category.objects.filter(subcategory_label='issue'):
        for i in range(random.randrange(2, 7)):
            name = random_lorem(2)
            status = random.choice(CategoryStatus.objects.all())
            mommy.make(Category, name=name,
                subcategory_label='sub_issue', parent=category, status=status)


CATEGORY_STATUS_BASE_ID = "20f530c4-ce6c-4724-9cfd-37a16e787"

def create_category_statuses():
    for i, status in enumerate(CATEGORY_STATUSES):
        id = generate_uuid(CATEGORY_STATUS_BASE_ID, incr=i)
        
        try:
            CategoryStatus.objects.get(name=status)
        except CategoryStatus.DoesNotExist:
            CategoryStatus.objects.create(id=id, name=status)


def create_category_status(name=None):
    create_category_statuses()

    if name and name not in CATEGORY_STATUSES:
        raise Exception("{} not in CategoryStatus list.".format(name))

    if name:
        status = CategoryStatus.objects.get(name=name)
    else:
        name = random.choice(CATEGORY_STATUSES)
        status = CategoryStatus.objects.get(name=name)

    return status
