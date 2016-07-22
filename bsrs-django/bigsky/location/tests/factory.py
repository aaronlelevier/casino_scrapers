from model_mommy import mommy

from location.models import (Location, LocationStatus, LocationType, LocationLevel,
    LOCATION_COMPANY, LOCATION_REGION, LOCATION_DISTRICT, LOCATION_STORE, LOCATION_FMU,)
from tenant.tests.factory import get_or_create_tenant
from utils.create import _generate_chars


SAN_DIEGO = 'san_diego'
LOS_ANGELES = 'los_angeles'


def create_location_levels():
    tenant = get_or_create_tenant()

    company, _ = LocationLevel.objects.get_or_create(name=LOCATION_COMPANY, tenant=tenant)
    region, _ = LocationLevel.objects.get_or_create(name=LOCATION_REGION, tenant=tenant)
    district, _ = LocationLevel.objects.get_or_create(name=LOCATION_DISTRICT, tenant=tenant)
    store, _ = LocationLevel.objects.get_or_create(name=LOCATION_STORE, tenant=tenant)
    fmu, _ = LocationLevel.objects.get_or_create(name=LOCATION_FMU, tenant=tenant)
    # JOIN's
    company.children.add(region)
    company.children.add(fmu)
    region.children.add(district)
    district.children.add(store)
    fmu.children.add(store)


def create_location_level(name=None):
    name = name or LOCATION_COMPANY
    obj, _ = LocationLevel.objects.get_or_create(name=name)
    return obj


def create_location_related_defaults(wrapped_function):
    def _wrapper(*args, **kwargs):
        LocationStatus.objects.get_or_create(name=LocationStatus.default)
        LocationType.objects.get_or_create(name=LocationType.default)
        result = wrapped_function(*args, **kwargs)
        return result
    return _wrapper


@create_location_related_defaults
def create_locations(_many=None):
    create_location_levels()
    company = Location.objects.create_top_level()
    # Region
    region_ll = LocationLevel.objects.get(name=LOCATION_REGION)
    east = mommy.make(Location, number=_generate_chars(), location_level=region_ll, name='east')
    # FMU
    fmu_ll = LocationLevel.objects.get(name=LOCATION_FMU)
    fmu = mommy.make(Location, number=_generate_chars(), location_level=fmu_ll, name=LOCATION_FMU)
    # District
    district_ll = LocationLevel.objects.get(name=LOCATION_DISTRICT)
    ca = mommy.make(Location, number=_generate_chars(), location_level=district_ll, name='ca')
    nv = mommy.make(Location, number=_generate_chars(), location_level=district_ll, name='nv')
    # Stores
    store_ll = LocationLevel.objects.get(name=LOCATION_STORE)
    san_diego = mommy.make(Location, number=_generate_chars(), location_level=store_ll, name=SAN_DIEGO)
    los_angeles = mommy.make(Location, number=_generate_chars(), location_level=store_ll, name=LOS_ANGELES)
    # JOIN's
    company.children.add(east)
    company.children.add(fmu)
    east.children.add(ca)
    east.children.add(nv)
    ca.children.add(san_diego)
    ca.children.add(los_angeles)

    # make sure that every LocationLevel has at least one Location for it.
    for x in LocationLevel.objects.all():
        if not Location.objects.filter(location_level=x).exists():
            mommy.make(Location, name=_generate_chars(), number=_generate_chars(),
                location_level=x)

    count = Location.objects.count()
    if _many and _many > count:
        additional = _many - count
        for x in range(additional):
            mommy.make(Location, number=_generate_chars(), location_level=store_ll, name=_generate_chars())


@create_location_related_defaults
def create_location(location_level=None):
    location_level = location_level or create_location_level()
    return mommy.make(Location, name=_generate_chars(), number=_generate_chars(),
        location_level=location_level)
