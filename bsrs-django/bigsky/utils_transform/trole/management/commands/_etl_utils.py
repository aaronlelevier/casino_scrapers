import logging
logger = logging.getLogger(__name__)

from django.conf import settings

from category.models import Category
from location.models import (LocationLevel, LOCATION_COMPANY, LOCATION_FMU,
    LOCATION_REGION, LOCATION_DISTRICT, LOCATION_STORE)
from person.models import Role
from tenant.tests.factory import get_or_create_tenant
from utils_transform.trole.models import DominoRole

ROLE_TYPE_INTERNAL = "admin.role.type.internal"
ROLE_TYPE_THIRD_PARTY = "admin.role.type.third_party"

SELECTION_CONTRACTOR = "Contractor"
SELECTION_REGION = "Region Manager"
SELECTION_DISTRICT = "District Manager"
SELECTION_STORE = "Store Manager"
SELECTION_FMU = "FMU Manager"


def run_role_migrations(tenant):
    for x in DominoRole.objects.all():
        create_role(x, tenant)


def create_role(domino_instance, tenant):
    role_type = get_role_type(domino_instance)
    location_level_name = get_location_level(domino_instance)

    try:
        location_level = LocationLevel.objects.get(name__exact=location_level_name,
                                                   tenant=tenant)
    except LocationLevel.DoesNotExist:
        location_level = None
        logger.info("LocationLevel name:{} Not Found.".format(location_level_name))
    
    role = Role.objects.create(
        name=domino_instance.name,
        role_type=role_type,
        location_level=location_level,
        tenant=tenant
    )

    cats = domino_instance.categories.split(";")    
    for cat in cats:
        try:
            category = Category.objects.get(name__exact=cat,
                                            label__exact=settings.TOP_LEVEL_CATEGORY_LABEL,
                                            tenant=tenant)
        except Category.DoesNotExist:
            logger.info("Category name:{} Not Found.".format(cat))
        else:
            role.categories.add(category)
    
    return role


def get_role_type(domino_instance):
    if domino_instance.selection == SELECTION_CONTRACTOR:
        role_type = ROLE_TYPE_THIRD_PARTY
    else:
        role_type = ROLE_TYPE_INTERNAL
    return role_type


def get_location_level(domino_instance):
    if domino_instance.selection == SELECTION_REGION:
        selection = LOCATION_REGION
    elif domino_instance.selection == SELECTION_DISTRICT:
        selection = LOCATION_DISTRICT
    elif domino_instance.selection == SELECTION_STORE:
        selection = LOCATION_STORE
    elif domino_instance.selection == SELECTION_FMU:
        selection = LOCATION_FMU
    else:
        selection = LOCATION_COMPANY
    return selection
