from model_mommy import mommy

from dtd.models import TreeData, DTD_START_ID
from tenant.models import Tenant


def get_or_create_tenant(name='foo'):
    try:
        return Tenant.objects.all()[0]
    except IndexError:
        kwargs = {
            'dt_start': TreeData.objects.get_start(),
        }
        return mommy.make(Tenant, **kwargs)
