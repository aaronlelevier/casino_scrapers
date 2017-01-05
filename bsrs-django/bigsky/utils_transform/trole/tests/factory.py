from model_mommy import mommy

from category.tests.factory import create_single_category
from location.models import LOCATION_REGION
from location.tests.factory import create_location_level
from utils.create import _generate_chars
from utils_transform.trole.models import DominoRole


ROLE_SELECTION = "Region Manager"
CATEGORIES = "Repair;Capex"
CATEGORY1 = "Repair"
CATEGORY2 = "Capex"


def get_role_none_id_fields():
    return [f.name for f in DominoRole._meta.get_fields()
            if f.name != 'id']


def get_random_data(fields):
    return {f: _generate_chars() for f in fields}


def create_domino_role(selection=ROLE_SELECTION):
    fields = get_role_none_id_fields()
    data = get_random_data(fields)
    data.update({
        'selection': selection,
        'categories': CATEGORIES
    })
    return mommy.make(DominoRole, **data)


def create_domino_role_and_related(tenant, selection=ROLE_SELECTION):
    #create location level that will be linked to Role
    create_location_level(LOCATION_REGION, tenant=tenant)
    #create categories that will be linked to this Role
    create_single_category(CATEGORY1, tenant=tenant)
    create_single_category(CATEGORY2, tenant=tenant)
    # DominoRole
    return create_domino_role(selection)
