from django.utils.translation import ugettext_lazy as _

from rest_framework.exceptions import ValidationError

from tenant.models import Tenant


class TenantEmailValidator(object):
    """
    `implementation_email` must be unique accross Tenants because
    it's used as the SC unique username.
    """
    message = _("Implementaion email previously used: {email}")

    def __call__(self, data):
        email = data['implementation_email']['email']

        if (Tenant.objects.filter(implementation_email__email=email)
                          .exists()):

            raise ValidationError(self.message.format(email=email))
