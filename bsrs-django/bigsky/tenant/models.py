from django.db import models

from accounting.models import Currency
from contact.models import Country
from utils.models import BaseModel


class Tenant(BaseModel):
    company_code = models.CharField(max_length=100, unique=True,
        help_text="Short code used to identify customer")
    company_name = models.CharField(max_length=100,
        help_text="Full customer company name")
    dashboard_text = models.TextField(blank=True, default="Welcome",
        help_text="Converts to HTML for display on Welcome page. Role inherits this field")
    dt_start = models.ForeignKey("dtd.TreeData", related_name="tenants", null=True,
        help_text="key to starting decision tree record")
    default_currency = models.ForeignKey(Currency, related_name="tenants", null=True,
        help_text="key to default currency")
    test_mode = models.BooleanField(blank=True, default=True,
        help_text="When in test mode all e-mail and other notifications will be sent to test addresses only")
    countries = models.ManyToManyField(Country, related_name='tenants')

    def save(self, *args, **kwargs):
        self._update_defaults()
        return super(Tenant, self).save(*args, **kwargs)

    def _update_defaults(self):
        if not self.default_currency:
            self.default_currency = Currency.objects.default()
