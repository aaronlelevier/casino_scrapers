import random
import string

from model_mommy import mommy

from utils_transform.tperson.models import DominoPerson

ROLENAME = "Internal Audit"
PERSONSTATUS = "Active"
AUTHAMOUNT = "92826.33"
PHONENUMBER = "987-654-3210"
EMAILADDRESS = "emailtest@testee.com"
SMSADDRESS = "smstest@testee.com"

def get_random_data(fields):
    data = {}

    for f in fields:
        data[f] = "".join([random.choice(string.ascii_letters) for x in range(10)])

    return data

def create_domino_person():
    fields = [f.name for f in DominoPerson._meta.get_fields()
             if f.name != 'id']
    data = get_random_data(fields)
    dom_person = mommy.make(DominoPerson, **data)
    
    #update selection
    dom_person.role = ROLENAME
    dom_person.status = PERSONSTATUS
    dom_person.auth_amount = AUTHAMOUNT
    dom_person.phone_number = PHONENUMBER
    dom_person.email_address = EMAILADDRESS
    dom_person.sms_address = SMSADDRESS
    dom_person.locations = None
    
    dom_person.save()
    
    return dom_person
