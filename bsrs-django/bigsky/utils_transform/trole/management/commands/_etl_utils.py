import logging
logger = logging.getLogger(__name__)

from person.models import Role
from location.models import LocationLevel
from category.models import Category
from utils_transform.trole.models import DominoRole


def create_role(domino_instance):

    if domino_instance.selection == "Contractor":
        role_type = "admin.role.type.third_party"
    else:
        role_type = "admin.role.type.internal"

    
    newrole = Role.objects.create(
        name=domino_instance.name,
        role_type=role_type
    )
    
    #connect location level to new role
    if domino_instance.selection == "Region Manager":
        selection = "Region"
    elif domino_instance.selection == "District Manager":
        selection = "District"
    elif domino_instance.selection == "Store Manager":
        selection = "Store"
    elif domino_instance.selection == "FMU Manager":
        selection = "Facility Management Unit"
    else:
        selection = "Company"
    
    try:
        newrole.location_level = LocationLevel.objects.get(name__exact=selection)
    except LocationLevel.DoesNotExist:
        logger.debug("LocationLevel name:{} Not Found.".format(selection))
    
    #join categories to new role
    cats = domino_instance.categories.split(";")    
    for cat in cats:
        try:
            newrole.categories.add(Category.objects.get(name__exact=cat, label__exact='Type'))
        except Category.DoesNotExist:
            logger.debug("Category name:{} Not Found.".format(cat))
            
    #need to call save on the new role to get the group created
    newrole.save()
    
    return newrole


def run_role_migrations():
    for x in DominoRole.objects.all():
        create_role(x)
