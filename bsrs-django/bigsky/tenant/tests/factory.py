from django.conf import settings

from model_mommy import mommy

from contact.tests.factory import create_contact_country
from dtd.models import TreeData
from tenant.models import Tenant
from utils.create import _generate_chars
from utils.helpers import generate_uuid


def get_or_create_tenant(company_name=settings.DEFAULT_TENANT_COMPANY_NAME):
    try:
        tenant = Tenant.objects.get(company_name=company_name)
    except Tenant.DoesNotExist:
        kwargs = {
            'id': generate_uuid(Tenant),
            'company_name': company_name,
            'company_code': _generate_chars()
        }

        tenant = mommy.make(Tenant, **kwargs)

        tenant.countries.add(create_contact_country())
    finally:
        tenant.dt_start = TreeData.objects.get_start()
        tenant.save()
        return tenant

