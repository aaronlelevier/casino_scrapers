from django.conf import settings

from model_mommy import mommy

from contact.models import Email, Address, PhoneNumber
from contact.tests.factory import create_contact_fixtures, create_contact_country
from dtd.models import TreeData
from tenant.models import Tenant
from utils.create import _generate_chars
from utils.helpers import generate_uuid


def get_or_create_tenant(company_name=settings.DEFAULT_TENANT_COMPANY_NAME, **kwargs):
    # check if any Emails, which would have been added in the contact
    # fixtures are present. If not, we need to add the contact fixtures
    if not Email.objects.first():
        create_contact_fixtures()
        
    try:
        tenant = Tenant.objects.get(company_name=company_name)
    except Tenant.DoesNotExist:
        defaults = {
            'id': generate_uuid(Tenant),
            'company_name': company_name,
            'company_code': _generate_chars(),
            'implementation_contact_initial': _generate_chars(),
            'implementation_email': Email.objects.first(),
            'billing_contact': _generate_chars(),
            'billing_email': Email.objects.first(),
            'billing_phone_number': PhoneNumber.objects.first(),
            'billing_address': Address.objects.first()
        }

        tenant = mommy.make(Tenant, **defaults)

        tenant.countries.add(create_contact_country())
    finally:
        kwargs.update({'dt_start': TreeData.objects.get_start()})
        tenant, _ = Tenant.objects.update_or_create(id=tenant.id, defaults=kwargs)

    return tenant


SC_SUBSCRIBER_POST_DATA = {
    "Name": "foo",
    "Address1": "9246 Lightwave Ave.",
    "Address2": "",
    "Country": "United States",
    "State": "California",
    "City": "San Diego",
    "Zip": "92123",
    "Email": "test@email.com",
    "Phone": "858-715-5000",
    "Fax": "858-715-5001",
    "ContactName": "Bob"
}