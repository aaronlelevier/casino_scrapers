from django.conf import settings

from model_mommy import mommy

from contact.models import Email, Address, PhoneNumber
from contact.tests.factory import create_contact_country
from dtd.models import TreeData
from tenant.models import Tenant
from utils.create import _generate_chars
from utils.helpers import generate_uuid


def get_or_create_tenant(company_name=settings.DEFAULT_TENANT_COMPANY_NAME, **kwargs):
    try:
        tenant = Tenant.objects.get(company_name=company_name)
    except Tenant.DoesNotExist:
        defaults = {
            'id': generate_uuid(Tenant),
            'company_name': company_name,
            'company_code': _generate_chars(),
            'implementation_email': mommy.make(Email, _fill_optional=['type']),
            'billing_email': mommy.make(Email, _fill_optional=['type']),
            'billing_phone_number': mommy.make(PhoneNumber, _fill_optional=['type']),
            'billing_address': mommy.make(Address, _fill_optional=['type', 'state', 'country'])
        }

        tenant = mommy.make(Tenant, **defaults)

        tenant.countries.add(create_contact_country())
    finally:
        kwargs.update({'dt_start': TreeData.objects.get_start()})
        tenant, _ = Tenant.objects.update_or_create(id=tenant.id, defaults=kwargs)

    return tenant


SC_SUBSCRIBER_POST_DATA = {
    "PrimaryUser": "foo",
    "Password": "bar",
    "ClientName": "biz",
    "Address1": "9246 Lightwave Ave.",
    "Address2": "",
    "Country": "United States",
    "City": "San Diego",
    "Zip": "92123",
    "Email": "test@email.com",
    "Phone": "858-715-5000",
    "Fax": "858-715-5001",
    "ContactName": "Bob",
    "IsActive": True
}