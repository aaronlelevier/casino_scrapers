import re

from django.core.exceptions import ValidationError


def validate_phone(phone):
    '''Return: valid Phone Number

    i.e. '+17025101234' else raise Form Error.
    '''
    error_messages = {
        'invalid_ph':_('Please enter a 10-digit phone number'),
    }
    try:
        re_phone = re.search(r'\d{10}$', phone).group()
    except AttributeError:
        raise ValidationError(error_messages['invalid_ph'])
    else:
        phone = "+1"+re_phone
    return phone
