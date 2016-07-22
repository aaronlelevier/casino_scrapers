from django.conf import settings

from model_mommy import mommy

from dtd.models import TreeData
from tenant.models import Tenant
from utils.create import _generate_chars
from utils.helpers import generate_uuid


def get_or_create_tenant(company_name=settings.DEFAULT_TENANT_COMPANY_NAME):
    try:
        return Tenant.objects.get(company_name=company_name)
    except Tenant.DoesNotExist:
        kwargs = {
            'dt_start': TreeData.objects.get_start(),
        }
        kwargs['id'] = generate_uuid(Tenant)
        kwargs['company_name'] = company_name
        kwargs['company_code'] = _generate_chars()

        return mommy.make(Tenant, **kwargs)
