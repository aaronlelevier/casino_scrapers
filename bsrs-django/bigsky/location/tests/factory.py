from model_mommy import mommy

from location.models import (Location, LocationStatus, LocationType, LocationLevel,
    LOCATION_COMPANY, LOCATION_REGION, LOCATION_DISTRICT, LOCATION_STORE, LOCATION_FMU,)
from tenant.tests.factory import get_or_create_tenant
from utils.create import _generate_chars


SAN_DIEGO = 'san_diego'
LOS_ANGELES = 'los_angeles'


def create_location_levels(tenant=None):
    tenant = tenant or get_or_create_tenant()

    company = create_location_level(LOCATION_COMPANY, tenant)
    region = create_location_level(LOCATION_REGION, tenant)
    district = create_location_level(LOCATION_DISTRICT, tenant)
    store = create_location_level(LOCATION_STORE, tenant)
    fmu = create_location_level(LOCATION_FMU, tenant)
    # JOIN's
    company.children.add(region)
    company.children.add(fmu)
    region.children.add(district)
    district.children.add(store)
    fmu.children.add(store)


def create_location_level(name=LOCATION_COMPANY, tenant=None,
                          children=None, parents=None):
    """
    :param name: String name
    :param tenant: Tenant instance
    :param children: List of LocationLevel instances
    :param parents: List of LocationLevel instances
    """
    tenant = tenant or get_or_create_tenant()

    obj, _ = LocationLevel.objects.get_or_create(name=name, tenant=tenant)

    if children:
        obj.children.set(children)

    if parents:
        obj.parents.set(parents)

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
    company = create_top_level_location()
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
def create_location(location_level=None, **kwargs):
    location_level = location_level or create_location_level()
    return mommy.make(Location, location_level=location_level, **kwargs)


@create_location_related_defaults
def create_top_level_location():
    try:
        location = Location.objects.get(name=LOCATION_COMPANY)
    except Location.DoesNotExist:
        location_level = create_location_level()
        location = create_location(location_level, name=LOCATION_COMPANY)
    return location


def create_other_location_level():
    """LocationLevel for a diff. Tenant"""
    tenant = get_or_create_tenant('other')
    return create_location_level(tenant=tenant)


def create_other_location():
    """Location for a diff. Tenant"""
    other_location_level = create_other_location_level()
    return create_location(location_level=other_location_level)
