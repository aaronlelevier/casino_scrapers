import logging
logger = logging.getLogger(__name__)

from django.conf import settings

from category.models import Category
from location.models import LocationLevel
from person.models import Role
from utils_transform.trole.models import DominoRole
from utils_transform.tlocation.models import (LOCATION_COMPANY, LOCATION_FMU,
    LOCATION_REGION, LOCATION_DISTRICT, LOCATION_STORE)

ROLE_TYPE_INTERNAL = "admin.role.type.internal"
ROLE_TYPE_THIRD_PARTY = "admin.role.type.third_party"

SELECTION_CONTRACTOR = "Contractor"
SELECTION_REGION = "Region Manager"
SELECTION_DISTRICT = "District Manager"
SELECTION_STORE = "Store Manager"
SELECTION_FMU = "FMU Manager"


def create_role(domino_instance):

    if domino_instance.selection == SELECTION_CONTRACTOR:
        role_type = ROLE_TYPE_THIRD_PARTY
    else:
        role_type = ROLE_TYPE_INTERNAL
    
    #connect location level to new role
    if domino_instance.selection == SELECTION_REGION:
        selection = LOCATION_REGION
    elif domino_instance.selection == SELECTION_DISTRICT:
        selection = LOCATION_DISTRICT
    elif domino_instance.selection == SELECTION_STORE:
        selection = LOCATION_STORE
    elif domino_instance.selection == SELECTION_FMU:
        selection = LOCATION_FMU
    else:
        # SELECTION_CONTRACTOR falls here
        selection = LOCATION_COMPANY

    try:
        location_level = LocationLevel.objects.get(name__exact=selection)
    except LocationLevel.DoesNotExist:
        location_level = None
        logger.debug("LocationLevel name:{} Not Found.".format(selection))
    
    role = Role.objects.create(
        name=domino_instance.name,
        role_type=role_type,
        location_level=location_level
    )

    #join categories to new role
    cats = domino_instance.categories.split(";")    
    for cat in cats:
        try:
            category = Category.objects.get(name__exact=cat,
                                            label__exact=settings.TOP_LEVEL_CATEGORY_LABEL)
        except Category.DoesNotExist:
            logger.debug("Category name:{} Not Found.".format(cat))
        else:
            role.categories.add(category)
    
    return role


def run_role_migrations():
    for x in DominoRole.objects.all():
        create_role(x)
