from django.db import models

from accounting.models import Currency
from contact.models import Country, PhoneNumber, Email, Address

from utils.models import BaseModel


class Tenant(BaseModel):

    SC_FIELDS = ['company_code', 'company_name', 'billing_contact', 'billing_address',
                 'billing_email', 'billing_phone_number', 'implementation_contact_initial',
                 'implementation_email']

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
    test_mode = models.BooleanField(blank=True, default=False,
        help_text="When in test mode all e-mail and other notifications will be sent to test addresses only")
    countries = models.ManyToManyField(Country, related_name='tenants')
    # implementation
    implementation_contact_initial = models.CharField(max_length=100,
        help_text="String name of the initial User that signs up that will be the Tenant Admin")
    implementation_email = models.ForeignKey(Email, related_name="implementation_emails",
        help_text="Email that will be used to send to the initual User that signs up")
    implementation_contact = models.ForeignKey("person.Person", max_length=100, null=True,
        help_text="Then Tenant Admin Person")
    # billing
    billing_contact = models.CharField(max_length=100)
    billing_phone_number = models.ForeignKey(PhoneNumber, related_name="billing_phone_numbers")
    billing_address = models.ForeignKey(Address, related_name="billing_emails")
    billing_email = models.ForeignKey(Email, related_name="billing_emails")

    def save(self, *args, **kwargs):
        self._update_defaults()
        return super(Tenant, self).save(*args, **kwargs)

    def _update_defaults(self):
        if not self.default_currency:
            self.default_currency = Currency.objects.default()

    @property
    def sc_post_data(self):
        return {
            "Address1": self.billing_address.address,
            "Address2": "",
            "Country": self.billing_address.country.common_name,
            "City": self.billing_address.city,
            "Zip": self.billing_address.postal_code,
            "Email": self.implementation_email.email,
            "Phone": self.billing_phone_number.number,
            "Fax": "",
            "ContactName": self.implementation_contact_initial,
        }
