import logging
from decimal import Decimal

from django.conf import settings

from contact.models import PhoneNumber, PhoneNumberType, Email, EmailType
from person.models import Person, Role, PersonStatus
from location.models import Location
from utils_transform.tperson.models import DominoPerson
from accounting.models import Currency, DEFAULT_CURRENCY

logger = logging.getLogger(__name__)

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
        
def create_person(domino_instance):
    
    try:
        role = Role.objects.get(name__exact=domino_instance.role)
    except Role.DoesNotExist:
        logger.debug("Role name:{} Not Found.".format(domino_instance.role))
        return
    
    top_location = Location.objects.get(name=settings.LOCATION_TOP_LEVEL_NAME)
    
    if role.location_level == top_location.location_level and domino_instance.locations != None or \
        role.location_level != top_location.location_level and domino_instance.locations == None:
        logger.debug("Data not consistent: username {}.".format(domino_instance.username))
        return
    
    first_name = domino_instance.first_name
    if first_name != None:
        first_name = first_name[:30]

    middle_initial = domino_instance.middle_initial
    if middle_initial != None:
        middle_initial = middle_initial[:1]

    last_name = domino_instance.last_name
    if last_name != None:
        last_name = last_name[:30]

    username = domino_instance.username
    if username != None:
        username = username[:30]
        
    auth_amount = domino_instance.auth_amount
    if auth_amount == "":
        auth_amount = "0"
        
    auth_currency = Currency.objects.get(name=DEFAULT_CURRENCY['name'])

    newperson = Person.objects.create(
        username = username,
        first_name = first_name,
        middle_initial = middle_initial,
        last_name = last_name,
        employee_id = domino_instance.employee_id,
        title = domino_instance.title,
        auth_amount = Decimal(auth_amount),
        auth_currency = auth_currency,
        role = role
    )
    
    #TBD will need to update this to be more secure
    newperson.set_password(username)
        
    if domino_instance.status == "Active":
        person_status = "admin.person.status.active"
    else:
        person_status = "admin.person.status.inactive"

    try:
        newperson.status = PersonStatus.objects.get(name__exact=person_status)
    except PersonStatus.DoesNotExist:
        logger.debug("PersonStatus name:{} Not Found.".format(person_status))
    
    #join locations to new person
    if domino_instance.locations:
        locations = domino_instance.locations.split(";")
        location_level = role.location_level
        
        for loc in locations:
            try:
                newperson.locations.add(Location.objects.get(number__exact=loc, location_level=location_level))
            except Location.DoesNotExist:
                logger.debug("Location number:{} Not Found.".format(loc))
                #delete person is not found
                newperson.delete()
                return
    else:
        #if a user doesn't have a location tie the person to the company location
        try:
            newperson.locations.add(Location.objects.get(name=settings.LOCATION_TOP_LEVEL_NAME))
        except Location.DoesNotExist:
            logger.debug("Location top level name:{} Not Found.".format(settings.LOCATION_TOP_LEVEL_NAME))
            #delete person if can't find top level
            newperson.delete()
            return

    if newperson:
        #add phone number and link to person
        create_phone_numbers(domino_instance, newperson)
        create_email(domino_instance, newperson)    
                
        #need to call save on the new person to run validations
        newperson.save()
        
        return newperson


def run_person_migrations():
    for x in DominoPerson.objects.all():
        create_person(x)
