import random
import string

from model_mommy import mommy

from utils_transform.tlocation.models import (LocationRegion, LocationDistrict,
    LocationStore)


DOMINO_LOCATION_FIELDS = ('name', 'number', 'telephone', 'carphone',
    'fax', 'email', 'address1', 'address2', 'zip', 'city','state', 'country',)


def get_random_data():
    return {f: random.choice(string.ascii_letters)
            for f in DOMINO_LOCATION_FIELDS}


def create_location_region():
    data = get_random_data()
    return mommy.make(LocationRegion, **data)


def create_location_district(region=None):
    data = get_random_data()

    district = mommy.make(LocationDistrict, **data)

    if region:
        district.regionnumber = region.number
        district.save()

    return district


def create_location_store(district=None):
    data = get_random_data()

    store = mommy.make(LocationStore, **data)

    if district:
        store.distnumber = district.number
        store.save()

    return store
