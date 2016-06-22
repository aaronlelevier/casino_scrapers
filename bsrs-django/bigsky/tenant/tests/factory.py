from model_mommy import mommy

from dtd.models import TreeData
from tenant.models import Tenant


def get_or_create_tenant(name='foo'):
    try:
        return Tenant.objects.all()[0]
    except IndexError:
        kwargs = {
            'dt_start': mommy.make(TreeData),
        }
        return mommy.make(Tenant, **kwargs)
