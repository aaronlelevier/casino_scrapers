import random
import string

from model_mommy import mommy

from utils.create import _generate_chars
from utils_transform.tlocation.models import LocationRegion

FACTORY_LOCATION_REGION_FIELDS = ('name', 'number', 'telephone', 'carphone',
    'fax', 'email', 'address1', 'address2', 'city','state', 'country',)


def create_location_region():
    fields = FACTORY_LOCATION_REGION_FIELDS

    data = {}
    for field in fields:
        data[field] = random.choice(string.ascii_letters)

    return mommy.make(LocationRegion, **data)
