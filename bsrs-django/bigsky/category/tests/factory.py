import random
from collections import namedtuple

from model_mommy import mommy

from category.models import (CATEGORY_STATUSES, LABEL_TRADE, Category,
                             CategoryStatus, ScCategory)
from tenant.tests.factory import get_or_create_tenant
from utils.create import random_lorem
from utils.helpers import generate_uuid

REPAIR = 'Repair'

def create_repair_category():
    try:
        return Category.objects.get(name=REPAIR)
    except Category.MultipleObjectsReturned:
        return Category.objects.filter(name=REPAIR).first()
    except Category.DoesNotExist:
        return mommy.make(Category, name=REPAIR, subcategory_label=LABEL_TRADE, description=1)


def create_single_category(name=None, parent=None, tenant=None, **kwargs):
    if not name:
        name = random_lorem()

    status = create_category_status()
    tenant = tenant or get_or_create_tenant()

    return Category.objects.create(
        name=name,
        subcategory_label=LABEL_TRADE,
        status=status,
        parent=parent,
        tenant=tenant,
        sc_category=get_sc_category_or_none(random_lorem()),
        **kwargs
    )


# id, name, label, subcategory_label, parent_id, sc_category_name
CATEGORIES = [
    [1, 'Repair', 'Type', 'Trade', None, 'GENERAL REPAIRS'],
    [2, 'Appliances', 'Trade', 'Issue', 1, 'APPLIANCES'],
    [3, 'Microwave', 'Issue', 'Sub-Issue', 2, 'KITCHEN EQUIPMENT'],
    [4, 'Broken', 'Sub-Issue', '', 3, None],
    [5, 'Replace', 'Sub-Issue', '', 3, None],
    [6, 'Refrigerator', 'Issue', 'Sub-Issue', 2, 'KITCHEN EQUIPMENT'],
    [7, 'Broken', 'Sub-Issue', '', 6, None],
    [8, 'Replace', 'Sub-Issue', '', 6, None],
    [9, 'Stove', 'Issue', 'Sub-Issue', 2, 'KITCHEN EQUIPMENT'],
    [10, 'Broken', 'Sub-Issue', '', 9, None],
    [11, 'Replace', 'Sub-Issue', '', 9, None],
    [12, 'Doors', 'Trade', 'Issue', 1, 'DOORS'],
    [13, 'Manual Door', 'Issue', 'Sub-Issue', 12, None],
    [14, 'Hinges', 'Sub-Issue', '', 13, None],
    [15, 'Knobs', 'Sub-Issue', '', 13, None],
    [16, 'Locks', 'Sub-Issue', '', 13, 'LOCKS and KEYS'],
    [17, 'Automatic Door', 'Issue', 'Sub-Issue', 12, None],
    [18, 'Sensors', 'Sub-Issue', '', 17, None],
    [19, 'Pads', 'Sub-Issue', '', 17, None],
    [20, 'Tracks', 'Sub-Issue', '', 17, None],
    [21, 'Electrical', 'Trade', 'Issue', 1, 'ELECTRICAL'],
    [22, 'Outlets', 'Issue', 'Sub-Issue', 21, None],
    [23, 'Wiring', 'Issue', 'Sub-Issue', 21, None],
    [24, 'Surge Protector', 'Issue', 'Sub-Issue', 21, None],
    [25, 'Fire', 'Trade', 'Issue', 1, 'FIRE PROTECTION and SAFETY'],
    [26, 'Extinguisher', 'Issue', 'Sub-Issue', 25, None],
    [27, 'Smoke Detector', 'Issue', 'Sub-Issue', 25, None],
    [28, 'Alarm', 'Issue', 'Sub-Issue', 25, None],
    [29, 'Gutters', 'Trade', 'Issue', 1, 'GUTTERS and REPAIRS'],
    [30, 'HVAC', 'Trade', 'Issue', 1, None],
    [31, 'Thermostats', 'Issue', 'Sub-Issue', 30, None],
    [32, 'Too Hot', 'Issue', 'Sub-Issue', 30, None],
    [33, 'Too Cold', 'Issue', 'Sub-Issue', 30, None],
    [34, 'Janitorial', 'Trade', 'Issue', 1, 'JANITORIAL'],
    [35, 'Cleaning', 'Issue', 'Sub-Issue', 34, None],
    [36, 'Disaster Recovery', 'Issue', 'Sub-Issue', 34, 'DISASTER RECOVERY'],
    [37, 'Parking Lot', 'Trade', 'Issue', 1, 'PAVING'],
    [38, 'Potholes', 'Issue', 'Sub-Issue', 37, None],
    [39, 'Repaving', 'Issue', 'Sub-Issue', 37, None],
    [40, 'Striping', 'Issue', 'Sub-Issue', 37, None],
    [41, 'Plumbing', 'Trade', 'Issue', 1, 'PLUMBING'],
    [42, 'Toilet', 'Issue', 'Sub-Issue', 41, None],
    [43, 'Sink', 'Issue', 'Sub-Issue', 41, None],
    [44, 'Water Heater', 'Issue', 'Sub-Issue', 41, 'WATER HEATERS'],
    [45, 'Urinals', 'Issue', 'Sub-Issue', 41, None],
    [46, 'Pipes', 'Issue', 'Sub-Issue', 41, None],
    [47, 'Signage', 'Trade', 'Issue', 1, 'SIGNS and BANNERS'],
    [48, 'Channel Lighting', 'Issue', 'Sub-Issue', 47, None],
    [49, 'Brand Signage', 'Issue', 'Sub-Issue', 47, None],
    [50, 'Pylon', 'Issue', 'Sub-Issue', 47, None],
    [51, 'Monument', 'Issue', 'Sub-Issue', 47, None],
    [52, 'Lettering', 'Issue', 'Sub-Issue', 47, None],
    [53, 'New', 'Sub-Issue', '', 52, None],
    [54, 'Replace', 'Sub-Issue', '', 52, None],
    [55, 'Maintenance', 'Type', 'Trade', None, 'GENERAL REPAIRS and MAINTENANCE'],
    [56, 'Parking Lot', 'Trade', 'Issue', 55, 'PAVING'],
    [57, 'Potholes', 'Issue', 'Sub-Issue', 56, None],
    [58, 'Repaving', 'Issue', 'Sub-Issue', 56, None],
    [59, 'Striping', 'Issue', 'Sub-Issue', 56, None],
    [60, 'Plumbing', 'Trade', 'Issue', 55, 'PLUMBING'],
    [61, 'Toilet', 'Issue', 'Sub-Issue', 60, None],
    [62, 'Sink', 'Issue', 'Sub-Issue', 60, None],
    [63, 'Water Heater', 'Issue', 'Sub-Issue', 60, 'WATER HEATERS'],
    [64, 'Urinals', 'Issue', 'Sub-Issue', 60, None],
    [65, 'Pipes', 'Issue', 'Sub-Issue', 60, None]
]


def create_categories(tenant=None):
    statuses = create_category_statuses()
    tenant = tenant or get_or_create_tenant()

    for x in CATEGORIES:
        CategoryData = namedtuple('CategoryData', ['id', 'name', 'label', 'subcategory_label', 'parent_id', 'sc_category_name'])
        data = CategoryData._make(x)._asdict()

        try:
            parent = Category.objects.get(tenant=tenant, description=data['parent_id'])
        except Category.DoesNotExist:
            parent = None

        try:
            Category.objects.get(tenant=tenant, name=data['name'], label=data['label'], description=data['id'])
        except Category.DoesNotExist:
            Category.objects.create(
                id=generate_uuid(Category),
                description=str(data.get('id')),
                name=data.get('name'),
                label=data.get('label'),
                subcategory_label=data.get('subcategory_label'),
                parent=parent,
                tenant=tenant,
                cost_amount=None if parent else 10,
                cost_code=None if parent else random_lorem(1),
                sc_category=get_sc_category_or_none(data.get('sc_category_name'))
            )

    return Category.objects.all()

def get_sc_category_or_none(sc_name=None):
    if sc_name:
        sc_category, _ = ScCategory.objects.get_or_create(
            key='.'.join(sc_name.split(' ')).lower(),
            sc_name=sc_name
        )
        return sc_category


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


def create_other_category():
    """Category for a diff. Tenant"""
    other_tenant = get_or_create_tenant('other')
    return create_single_category(tenant=other_tenant)
