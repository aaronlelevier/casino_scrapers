from model_mommy import mommy

from utils.create import _generate_chars
from utils_transform.tperson.models import DominoPerson


ROLE_NAME = "Internal Audit"
PERSON_STATUS = "Active"
AUTH_AMOUNT = "92826.33"
PHONE_NUMBER = "987-654-3210"
EMAIL_ADDRESS = "emailtest@testee.com"
SMS_ADDRESS = "smstest@testee.com"


def get_person_none_id_fields():
    return [f.name for f in DominoPerson._meta.get_fields()
            if f.name != 'id']


def get_random_data(fields):
    return {f: _generate_chars() for f in fields}


def create_domino_person():
    fields = get_person_none_id_fields()
    data = get_random_data(fields)
    data.update({
        'role': ROLE_NAME,
        'status': PERSON_STATUS,
        'auth_amount': AUTH_AMOUNT,
        'phone_number': PHONE_NUMBER,
        'email_address': EMAIL_ADDRESS,
        'sms_address': SMS_ADDRESS,
        'locations': None
    })
    return mommy.make(DominoPerson, **data)
