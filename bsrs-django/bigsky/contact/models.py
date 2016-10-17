from django.contrib.contenttypes.models import ContentType
from django.core.mail import send_mail
from django.db import models

from utils.fields import MyGenericForeignKey
from utils.models import BaseModel, BaseManager, BaseQuerySet, BaseNameOrderModel


class Country(BaseModel):
    sort_order = models.IntegerField(default=0)
    common_name = models.CharField(max_length=100, blank=True)
    formal_name = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=100, blank=True)
    sub_type = models.CharField(max_length=100, blank=True)
    sovereignty = models.CharField(max_length=100, blank=True)
    capital = models.CharField(max_length=100, blank=True)
    currency_code = models.CharField("ISO 4217 Currency Code", max_length=100, blank=True)
    currency_name = models.CharField("ISO 4217 Currency Name", max_length=100, blank=True)
    telephone_code = models.CharField("ITU-T Telephone Code", max_length=100, blank=True)
    two_letter_code = models.CharField("ISO 3166-1 2 Letter Code", max_length=100, blank=True)
    three_letter_code = models.CharField("ISO 3166-1 3 Letter Code", max_length=100, blank=True)
    number = models.CharField("ISO 3166-1 Number", max_length=100, blank=True)
    country_code_tld = models.CharField("IANA Country Code TLD", max_length=100, blank=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'common_name': self.common_name
        }


class StateQuerySet(BaseQuerySet):

    def tenant(self, tenant):
        return self.filter(country__tenants=tenant)


class StateManager(BaseManager):

    queryset_cls = StateQuerySet

    def tenant(self, tenant):
        return self.get_queryset().tenant(tenant)


class State(BaseModel):
    country = models.ForeignKey(Country, related_name='states', null=True)
    country_code = models.CharField(max_length=100, blank=True)
    state_code = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=100, blank=True)
    classification = models.CharField(max_length=100, blank=True)

    objects = StateManager()

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'state_code': self.state_code
        }


class BaseContactModel(BaseModel):
    """
    GenericForeignKey fields that will be used for all Contact models.
    """
    content_type = models.ForeignKey(ContentType)
    object_id = models.UUIDField()
    content_object = MyGenericForeignKey('content_type', 'object_id')

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.object_id = self.content_object.id
        return super(BaseContactModel, self).save(*args, **kwargs)


class PhoneNumberType(BaseNameOrderModel):
    TELEPHONE = 'admin.phonenumbertype.telephone'
    FAX = 'admin.phonenumbertype.fax'
    CELL = 'admin.phonenumbertype.cell'
    OFFICE = 'admin.phonenumbertype.office'
    MOBILE = 'admin.phonenumbertype.mobile'

    ALL = [
        TELEPHONE,
        FAX,
        CELL,
        OFFICE,
        MOBILE
    ]


class PhoneNumber(BaseContactModel):
    """
    TODO: Will use this "phone number lib" for validation:

    https://github.com/daviddrysdale/python-phonenumbers
    """
    type = models.ForeignKey(PhoneNumberType, blank=True, null=True)
    number = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ('number',)


class AddressType(BaseNameOrderModel):
    LOCATION = 'admin.address_type.location'
    OFFICE = 'admin.address_type.office'
    STORE = 'admin.address_type.store'
    SHIPPING = 'admin.address_type.shipping'

    ALL = [
        LOCATION,
        OFFICE,
        STORE,
        SHIPPING
    ]


class AddressQuerySet(BaseQuerySet):

    def office_and_stores(self):
        return (self.filter(type__name__in=[AddressType.OFFICE,
                                            AddressType.STORE])
                    .distinct())


class AddressManager(BaseManager):

    queryset_cls = AddressQuerySet

    def office_and_stores(self):
        return self.get_queryset().office_and_stores()


class Address(BaseContactModel):
    """
    Not every field is required to be a valid address, but at 
    least one "non-foreign-key" field must be populated.

    ForeignKey Reqs: either the `location` or `person` FK must be 
    populated, but not both.
    """
    type = models.ForeignKey(AddressType, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.TextField(blank=True, null=True)
    state = models.ForeignKey(State, blank=True, null=True)
    postal_code = models.TextField(blank=True, null=True)
    country = models.ForeignKey(Country, blank=True, null=True)

    objects = AddressManager()

    class Meta:
        ordering = ('address',)

    @property
    def is_office_or_store(self):
        return self.type and self.type.name in [AddressType.OFFICE,
                                                AddressType.STORE]


class EmailType(BaseNameOrderModel):
    LOCATION = 'admin.emailtype.location'
    WORK = 'admin.emailtype.work'
    PERSONAL = 'admin.emailtype.personal'
    SMS = 'admin.emailtype.sms'

    ALL = [
        LOCATION,
        WORK,
        PERSONAL,
        SMS,
    ]


class EmailQuerySet(BaseQuerySet):
    pass


class EmailManager(BaseManager):

    queryset_cls = EmailQuerySet

    def process_send_email(self, action):
        # use ContentType to avoid circular import
        content_type = ContentType.objects.get(app_label="person", model="person")
        Person = content_type.model_class()

        for person in Person.objects.filter(id__in=action.content.get('recipients', [])):
            for email in person.emails.filter(type__name=EmailType.WORK):
                subject = action.content.get('subject', '')
                body = action.content.get('body', '')
                self.send_mail(email, subject, body)

    def send_mail(self, email, subject, body):
        pass


class Email(BaseContactModel):
    type = models.ForeignKey(EmailType, blank=True, null=True)
    email = models.TextField(blank=True, null=True)

    objects = EmailManager()

    class Meta:
        ordering = ('email',)
