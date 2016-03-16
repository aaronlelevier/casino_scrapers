import random
import string

from model_mommy import mommy

from utils_transform.trole.models import DominoRole
from location.models import LocationLevel
from location.tests.factory import create_location_level
from category.tests.factory import create_single_category


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
    dom_role.selection = 'Region Manager'
    dom_role.categories = 'Repair, Capex'
    dom_role.save()
    
    #create location level that will be linked to Role
    create_location_level('Region')
    
    #create categories that will be linked to this Role
    create_single_category('Repair')
    create_single_category('Capex')

    return dom_role
