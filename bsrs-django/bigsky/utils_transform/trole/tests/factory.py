import random
import string

from model_mommy import mommy

from utils_transform.trole.models import DominoRole
from location.tests.factory import create_location_level
from category.tests.factory import create_single_category

ROLESELECTION = "Region Manager"
LOCATIONLEVEL = "Region"
CATEGORIES = "Repair;Capex"
CATEGORY1 = "Repair"
CATEGORY2 = "Capex"

def get_random_data(fields):
    data = {}

    for f in fields:
        data[f] = "".join([random.choice(string.ascii_letters) for x in range(10)])

    return data

def create_domino_role():
    fields = [f.name for f in DominoRole._meta.get_fields()
             if f.name != 'id']
    data = get_random_data(fields)
    dom_role = mommy.make(DominoRole, **data)
    
    #update selection
    dom_role.selection = ROLESELECTION
    dom_role.categories = CATEGORIES
    dom_role.save()
    
    #create location level that will be linked to Role
    create_location_level(LOCATIONLEVEL)
    
    #create categories that will be linked to this Role
    create_single_category(CATEGORY1)
    create_single_category(CATEGORY2)

    return dom_role
