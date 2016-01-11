import random

from category.models import Category, CATEGORY_STATUSES, CategoryStatus
from utils.create import random_lorem
from utils.helpers import generate_uuid


CATEGORY_BASE_ID = "24f530c4-ce6c-4724-9cfd-37a16e787"

TOP_LEVEL_CATEGORIES = ['repair', 'Building', 'IT', 'Store Operations']


def create_single_category(name=None, parent=None):
    if not name:
        name = random_lorem()

    status = create_category_status()

    return Category.objects.create(
        name=name,
        subcategory_label='trade',
        status=status,
        parent=parent
    )

    
def create_categories(_many=None):
    statuses = create_category_statuses()
    top_levels = TOP_LEVEL_CATEGORIES
    top_level_children = [['plumbing','electrical'], ['Alarm', 'Carpet'], ['Computer', 'Monitor'], ['HR', 'Loss Prevention']]
    for i, name in enumerate(top_levels):
        incr = Category.objects.count()
        Category.objects.create(
            id=generate_uuid(CATEGORY_BASE_ID, incr),
            name=name,
            subcategory_label='trade',
            status=random.choice(statuses)
        )

    for i, name_arr in enumerate(top_level_children):
        for x, name in enumerate(name_arr):
            incr = Category.objects.count()
            Category.objects.create(
                id=generate_uuid(CATEGORY_BASE_ID, incr),
                name=name,
                subcategory_label='issue',
                parent=Category.objects.filter(name=top_levels[i]).first(),
                status=random.choice(statuses)
            )

    # Issue
    for category in Category.objects.filter(subcategory_label='issue'):
        for i in range(random.randrange(2, 7)):
            name = random_lorem(2)
            status = random.choice(statuses)
            incr = Category.objects.count()
            Category.objects.create(
                id=generate_uuid(CATEGORY_BASE_ID, incr+1),
                name=name,
                subcategory_label='sub_issue',
                parent=category,
                status=status
            )

    return Category.objects.all()


CATEGORY_STATUS_BASE_ID = "20f530c4-ce6c-4724-9cfd-37a16e787"


def create_category_statuses():
    statuses = []

    for i, status in enumerate(CATEGORY_STATUSES):
        id = generate_uuid(CATEGORY_STATUS_BASE_ID, incr=i)
        
        try:
            cs = CategoryStatus.objects.get(name=status)
        except CategoryStatus.DoesNotExist:
            cs = CategoryStatus.objects.create(id=id, name=status)
        finally:
            statuses.append(cs)

    return statuses


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
