from django.conf import settings

from model_mommy import mommy

from dtd.models import TreeData
from tenant.models import Tenant


def get_or_create_tenant(company_name=settings.DEFAULT_TENANT_COMPANY_NAME):
    try:
        return Tenant.objects.all()[0]
    except IndexError:
        kwargs = {
            'dt_start': TreeData.objects.get_start(),
        }
        kwargs['company_name'] = company_name
        kwargs['company_code'] = settings.DEFAULT_TENANT_COMPANY_CODE

        return mommy.make(Tenant, **kwargs)
