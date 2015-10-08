from model_mommy import mommy

from location.models import Location, LocationLevel
from utils.create import _generate_chars

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
    create_location_levels()
    # Region
    region_ll = LocationLevel.objects.get(name='region')
    east = mommy.make(Location, number=_generate_chars(), location_level=region_ll, name='east')
    # District
    district_ll = LocationLevel.objects.get(name='district')
    ca = mommy.make(Location, number=_generate_chars(), location_level=district_ll, name='ca')
    nv = mommy.make(Location, number=_generate_chars(), location_level=district_ll, name='nv')
    # Stores
    store_ll = LocationLevel.objects.get(name='store')
    san_diego = mommy.make(Location, number=_generate_chars(), location_level=store_ll, name='san_diego')
    los_angeles = mommy.make(Location, number=_generate_chars(), location_level=store_ll, name='los_angeles')
    # JOIN's
    east.children.add(ca)
    east.children.add(nv)
    ca.children.add(san_diego)
    ca.children.add(los_angeles)
    