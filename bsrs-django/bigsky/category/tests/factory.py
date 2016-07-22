from collections import namedtuple
import random

from category.models import Category, CATEGORY_STATUSES, CategoryStatus
from tenant.tests.factory import get_or_create_tenant
from utils.create import random_lorem
from utils.helpers import generate_uuid


def create_single_category(name=None, parent=None):
    if not name:
        name = random_lorem()

    status = create_category_status()
    tenant = get_or_create_tenant()

    return Category.objects.create(
        name=name,
        subcategory_label='trade',
        status=status,
        tenant=tenant,
        parent=parent
    )


# id, name, label, subcategory_label, parent_id
CATEGORIES = [
    [1, 'Repair', 'Type', 'Trade', None],
    [2, 'Appliances', 'Trade', 'Issue', 1],
    [3, 'Microwave', 'Issue', 'Sub-Issue', 2],
    [4, 'Broken', 'Sub-Issue', '', 3],
    [5, 'Replace', 'Sub-Issue', '', 3],
    [6, 'Refrigerator', 'Issue', 'Sub-Issue', 2],
    [7, 'Broken', 'Sub-Issue', '', 6],
    [8, 'Replace', 'Sub-Issue', '', 6],
    [9, 'Stove', 'Issue', 'Sub-Issue', 2],
    [10, 'Broken', 'Sub-Issue', '', 9],
    [11, 'Replace', 'Sub-Issue', '', 9],
    [12, 'Doors', 'Trade', 'Issue', 1],
    [13, 'Manual Door', 'Issue', 'Sub-Issue', 12],
    [14, 'Hinges', 'Sub-Issue', '', 13],
    [15, 'Knobs', 'Sub-Issue', '', 13],
    [16, 'Locks', 'Sub-Issue', '', 13],
    [17, 'Automatic Door', 'Issue', 'Sub-Issue', 12],
    [18, 'Sensors', 'Sub-Issue', '', 17],
    [19, 'Pads', 'Sub-Issue', '', 17],
    [20, 'Tracks', 'Sub-Issue', '', 17],
    [21, 'Electrical', 'Trade', 'Issue', 1],
    [22, 'Outlets', 'Issue', 'Sub-Issue', 21],
    [23, 'Wiring', 'Issue', 'Sub-Issue', 21],
    [24, 'Surge Protector', 'Issue', 'Sub-Issue', 21],
    [25, 'Fire', 'Trade', 'Issue', 1],
    [26, 'Extinguisher', 'Issue', 'Sub-Issue', 25],
    [27, 'Smoke Detector', 'Issue', 'Sub-Issue', 25],
    [28, 'Alarm', 'Issue', 'Sub-Issue', 25],
    [29, 'Gutters', 'Trade', 'Issue', 1],
    [30, 'HVAC', 'Trade', 'Issue', 1],
    [31, 'Thermostats', 'Issue', 'Sub-Issue', 30],
    [32, 'Too Hot', 'Issue', 'Sub-Issue', 30],
    [33, 'Too Cold', 'Issue', 'Sub-Issue', 30],
    [34, 'Janitorial', 'Trade', 'Issue', 1],
    [35, 'Cleaning', 'Issue', 'Sub-Issue', 34],
    [36, 'Disaster Recovery', 'Issue', 'Sub-Issue', 34],
    [37, 'Parking Lot', 'Trade', 'Issue', 1],
    [38, 'Potholes', 'Issue', 'Sub-Issue', 37],
    [39, 'Repaving', 'Issue', 'Sub-Issue', 37],
    [40, 'Striping', 'Issue', 'Sub-Issue', 37],
    [41, 'Plumbing', 'Trade', 'Issue', 1],
    [42, 'Toilet', 'Issue', 'Sub-Issue', 41],
    [43, 'Sink', 'Issue', 'Sub-Issue', 41],
    [44, 'Water Heater', 'Issue', 'Sub-Issue', 41],
    [45, 'Urinals', 'Issue', 'Sub-Issue', 41],
    [46, 'Pipes', 'Issue', 'Sub-Issue', 41],
    [47, 'Signage', 'Trade', 'Issue', 1],
    [48, 'Channel Lighting', 'Issue', 'Sub-Issue', 47],
    [49, 'Brand Signage', 'Issue', 'Sub-Issue', 47],
    [50, 'Pylon', 'Issue', 'Sub-Issue', 47],
    [51, 'Monument', 'Issue', 'Sub-Issue', 47],
    [52, 'Lettering', 'Issue', 'Sub-Issue', 47],
    [53, 'New', 'Sub-Issue', '', 52],
    [54, 'Replace', 'Sub-Issue', '', 52],
    [55, 'Maintenance', 'Type', 'Trade', None],
    [56, 'Parking Lot', 'Trade', 'Issue', 55],
    [57, 'Potholes', 'Issue', 'Sub-Issue', 56],
    [58, 'Repaving', 'Issue', 'Sub-Issue', 56],
    [59, 'Striping', 'Issue', 'Sub-Issue', 56],
    [60, 'Plumbing', 'Trade', 'Issue', 55],
    [61, 'Toilet', 'Issue', 'Sub-Issue', 60],
    [62, 'Sink', 'Issue', 'Sub-Issue', 60],
    [63, 'Water Heater', 'Issue', 'Sub-Issue', 60],
    [64, 'Urinals', 'Issue', 'Sub-Issue', 60],
    [65, 'Pipes', 'Issue', 'Sub-Issue', 60]
]


def create_categories():
    statuses = create_category_statuses()
    tenant = get_or_create_tenant()

    for x in CATEGORIES:
        CategoryData = namedtuple('CategoryData', ['id', 'name', 'label', 'subcategory_label', 'parent_id'])
        data = CategoryData._make(x)._asdict()

        try:
            parent = Category.objects.get(description=data['parent_id'])
        except Category.DoesNotExist:
            parent = None

        try:
            Category.objects.get(name=data['name'], label=data['label'], description=data['id'])
        except Category.DoesNotExist:
            Category.objects.create(
                id=generate_uuid(Category),
                description=str(data['id']),
                name=data['name'],
                label=data['label'],
                subcategory_label=data['subcategory_label'],
                parent=parent,
                tenant=tenant
            )

    return Category.objects.all()


def create_category_statuses():
    statuses = []

    for status in CATEGORY_STATUSES:
        id = generate_uuid(CategoryStatus)
        
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
