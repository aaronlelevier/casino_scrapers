import logging
logger = logging.getLogger(__name__)

from contact.models import PhoneNumber, PhoneNumberType, Email, EmailType
from location.models import Location, LOCATION_COMPANY
from person.models import Person, Role, PersonStatus
from utils_transform.tperson.models import DominoPerson


def create_phone_numbers(domino_person, related_instance):
    ph_types = PhoneNumberType.objects.all()
    
    if domino_person.phone_number:
        ph_type = ph_types.get(name='admin.phonenumbertype.telephone')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_person.phone_number, type=ph_type)


def create_email(domino_person, related_instance):
    if domino_person.email_address:
        email_type = EmailType.objects.get(name='admin.emailtype.personal')
        Email.objects.create(content_object=related_instance,
            object_id=related_instance.id, email=domino_person.email_address, type=email_type)

    if domino_person.sms_address:
        email_type = EmailType.objects.get(name='admin.emailtype.sms')
        Email.objects.create(content_object=related_instance,
            object_id=related_instance.id, email=domino_person.sms_address, type=email_type)


def run_person_migrations():
    for x in DominoPerson.objects.all():
        create_person(x)

    # Make the 'bigsky' Person staff & superuser so they can view-all
    # in the Django Admin. Admin can be used for debugging, etc.
    bigsky_person_update()


def bigsky_person_update():
    try:
        person = Person.objects.get(username='bigsky')
    except Person.DoesNotExist:
        pass
    else:
        person.is_staff = True
        person.is_superuser = True
        person.save()
        return person


def create_person(domino_instance):
    try:
        role = Role.objects.get(name__exact=domino_instance.role)
    except Role.DoesNotExist:
        log_role_not_found(domino_instance)
        return
    
    # Users that fall in this 'if' block will be created, but logged
    if top_level_with_locations(role, domino_instance):
        log_top_level_with_locations(role, domino_instance)
        # Give User top level location
        domino_instance.locations = LOCATION_COMPANY
        domino_instance.save()

    if non_top_level_with_no_locations(role, domino_instance):
        log_non_top_level_with_no_locations(role, domino_instance)
        return

    domino_instance = shorten_strings(domino_instance, ['first_name', 'last_name', 'username'])
    domino_instance = shorten_strings(domino_instance, ['middle_initial'], length=1)

    status = get_person_status(domino_instance)

    newperson = Person.objects.create_user(username=domino_instance.username,
        email=None,
        password=domino_instance.username,
        status=status,
        first_name = domino_instance.first_name,
        middle_initial = domino_instance.middle_initial,
        last_name = domino_instance.last_name,
        employee_id = domino_instance.employee_id,
        title = domino_instance.title,
        auth_amount = 0 if not domino_instance.auth_amount else domino_instance.auth_amount,
        role = role
    )

    location_not_found = add_locations(newperson, role, domino_instance)
    if location_not_found:
        newperson.delete()
        return newperson

    #add phone number and link to person
    create_phone_numbers(domino_instance, newperson)
    create_email(domino_instance, newperson)
        
    return newperson


def log_role_not_found(domino_instance):
    logger.info("Person id:{person.id}, username:{person.username}; Role name:{person.role} Not Found."
                .format(person=domino_instance))


def top_level_with_locations(role, domino_instance):
    return all([role.location_level.is_top_level, domino_instance.locations])


def log_top_level_with_locations(role, domino_instance):
    logger.info("Person id:{person.id}, username:{person.username}; Top LocationLevel: {level} with Locations: {locations}"
                .format(person=domino_instance, level=role.location_level, locations=domino_instance.locations))


def non_top_level_with_no_locations(role, domino_instance):
    return role.location_level.is_top_level == False and domino_instance.locations == None


def log_non_top_level_with_no_locations(role, domino_instance):
    logger.info("Person id:{person.id}, username:{person.username}; Non-Top LocationLevel:{level} with no Locations"
                .format(person=domino_instance, level=role.location_level))


def get_person_status(domino_instance):
    if domino_instance.status == "Active":
        name = "admin.person.status.active"
    else:
        name = "admin.person.status.inactive"

    obj, _ = PersonStatus.objects.get_or_create(name=name)
    return obj


def shorten_strings(obj, strings, length=30):
    for string in strings:
        s = getattr(obj, string)
        if s:
            setattr(obj, string, s[:length])
    return obj


def add_locations(person, role, domino_instance):
    location_not_found = False

    #join locations to new person
    if domino_instance.locations:
        locations = domino_instance.locations.split(";")
        for location in locations:
            try:
                location = Location.objects.get(number__exact=location, location_level=role.location_level)
            except Location.DoesNotExist:
                log_location_does_not_match(person, domino_instance, location)
                location_not_found = True
            else:
                person.locations.add(location)
    else:
        top_location = Location.objects.create_top_level()
        person.locations.add(top_location)

    return location_not_found


def log_location_does_not_match(person, domino_instance, location):
    logger.info(
        "Django id: {dj_person.id}; Person id:{person.id}, username:{person.username}; \
Location number:{location} does not match LocationLevel: {level}".format(
    dj_person=person, person=domino_instance, location=location, level=person.role.location_level))
