from model_mommy import mommy

from location.models import (Location, LocationLevel, LocationStatus,
    LocationType)


def create_location_levels():
    '''
    ``district_lp`` = district loss prevention
    '''
    region = mommy.make(LocationLevel, name='region')
    district = mommy.make(LocationLevel, name='district')
    district_lp = mommy.make(LocationLevel, name='district_lp')
    store = mommy.make(LocationLevel, name='store')
    department = mommy.make(LocationLevel, name='department')
    # JOIN's
    region.children.add(district)
    region.children.add(district_lp)
    district.children.add(store)
    store.children.add(department)

def create_locations():
    pass
