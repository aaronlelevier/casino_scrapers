import logging
logger = logging.getLogger(__name__)

from contact.models import (State, Country, PhoneNumber, PhoneNumberType,
    Email, EmailType, Address, AddressType)
from location.models import Location, LOCATION_REGION, LOCATION_DISTRICT


def create_phone_numbers(domino_location, related_instance):
    ph_types = PhoneNumberType.objects.all()
    
    if domino_location.telephone:
        ph_type = ph_types.get(name='admin.phonenumbertype.telephone')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.telephone, type=ph_type)

    if domino_location.carphone:
        ph_type = ph_types.get(name='admin.phonenumbertype.cell')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.carphone, type=ph_type)

    if domino_location.fax:
        ph_type = ph_types.get(name='admin.phonenumbertype.fax')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.fax, type=ph_type)


def create_email(domino_location, related_instance):
    email_type = EmailType.objects.get(name='admin.emailtype.location')

    return Email.objects.create(content_object=related_instance,
        object_id=related_instance.id, email=domino_location.email,
        type=email_type)


def create_address(domino_location, related_instance):
    address_type = AddressType.objects.get(name='admin.address_type.location')

    combined = _resolve_none_str(domino_location.address1)+' '+_resolve_none_str(domino_location.address2)
    address = combined if combined.strip() else None

    state = _resolve_state(domino_location.state)
    country = _resolve_country(domino_location.country)

    address = {
        'address': address,
        'city': domino_location.city,
        'state': state,
        'postal_code': domino_location.zip,
        'country': country
    }
    if any(address.values()):
        return Address.objects.create(content_object=related_instance,
            object_id=related_instance.id, type=address_type, **address)


def _resolve_none_str(s):
    return s if s else ''


def _resolve_state(domino_abbr):
    domino_abbr = domino_abbr.strip() if domino_abbr else None
    if domino_abbr:
        try:
            state = State.objects.get(state_code=domino_abbr)
        except State.DoesNotExist:
            state = State.objects.create(name=domino_abbr, state_code=domino_abbr)
        return state


def _resolve_country(country):
    country = country.strip() if country else None
    if country:
        try:
            country = Country.objects.get(common_name=country)
        except Country.DoesNotExist:
            country = Country.objects.create(common_name=country)
        return country


def join_company_to_region(company, related_instance):
    company.children.add(related_instance)


def join_region_to_district(domino_location, related_instance):
    regions = Location.objects.filter(location_level__name=LOCATION_REGION)

    try:
        region = regions.get(number=domino_location.regionnumber)
    except Location.DoesNotExist as e:
        logger.debug("Location.pk:{}, LocationRegion.regionnumber:{} Not Found."
            .format(related_instance.id, domino_location.regionnumber))
    else:
        region.children.add(related_instance)


def join_district_to_store(domino_location, related_instance):
    districts = Location.objects.filter(location_level__name=LOCATION_DISTRICT)

    try:
        district = districts.get(number=domino_location.distnumber)
    except Location.DoesNotExist as e:
        logger.debug("Location.pk:{}, LocationDistrict.distnumber:{} Not Found."
            .format(related_instance.id, domino_location.distnumber))
    else:
        district.children.add(related_instance)
