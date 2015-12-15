import random
import string

from model_mommy import mommy

from utils_transform.tlocation.models import LocationRegion, LocationDistrict


FACTORY_LOCATION_REGION_FIELDS = ('name', 'number', 'telephone', 'carphone',
    'fax', 'email', 'address1', 'address2', 'city','state', 'country',)


def create_location_region():
    fields = FACTORY_LOCATION_REGION_FIELDS

    data = {}
    for field in fields:
        data[field] = random.choice(string.ascii_letters)

    return mommy.make(LocationRegion, **data)


def create_location_district(region=None):
    fields = FACTORY_LOCATION_REGION_FIELDS

    data = {}
    for field in fields:
        data[field] = random.choice(string.ascii_letters)

    district = mommy.make(LocationDistrict, **data)

    if region:
        district.regionnumber = region.number
        district.save()

    return district
