from django.utils.timezone import now

from model_mommy import mommy

from person.tests.factory import create_single_person
from utils.create import _generate_chars
from utils_transform.tticket.models import DominoTicket


def get_ticket_none_id_and_date_fields():
    return [f.name for f in DominoTicket._meta.get_fields()
            if f.name not in ('id', 'create_date', 'complete_date')]


def get_random_data(fields):
    return {f: _generate_chars() for f in fields}


def create_domino_ticket():
    fields = get_ticket_none_id_and_date_fields()
    data = get_random_data(fields)
    person = create_single_person()
    data.update({
        'type': 'Repair',
        'trade': 'Appliances',
        'issue': 'Microwave',
        'assigned_to': person.fullname,
        'create_date': now(),
        'complete_date': now()
    })
    return mommy.make(DominoTicket, **data)
