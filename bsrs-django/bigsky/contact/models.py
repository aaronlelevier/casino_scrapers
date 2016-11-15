import os

import logging
logger = logging.getLogger(__name__)

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core.mail import EmailMultiAlternatives
from django.db import models

from twilio import TwilioRestException
from twilio.rest import TwilioRestClient

from automation.helpers import Interpolate
from utils.fields import MyGenericForeignKey
from utils.helpers import get_model_class, get_person_and_role_ids
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
    content_type = models.ForeignKey(ContentType, null=True)
    object_id = models.UUIDField(null=True)
    content_object = MyGenericForeignKey('content_type', 'object_id')

    class Meta:
        abstract = True


class EmailAndSmsMixin(object):

    def get_recipients(self, action, ticket):
        person_ids, role_ids = get_person_and_role_ids(action.content)

        Person = get_model_class("person")
        person_list = Person.objects.filter(id__in=person_ids)
        person_list_from_role_ids = Person.objects.filter_by_ticket_location_and_role(
            ticket, role_ids)

        result_list = person_list | person_list_from_role_ids

        return result_list.distinct()


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


class PhoneNumberQuerySet(BaseQuerySet):
    pass


class PhoneNumberManager(EmailAndSmsMixin, BaseManager):

    queryset_cls = PhoneNumberQuerySet

    def process_send_sms(self, ticket, action, event):
        Person = get_model_class("person")

        for person in self.get_recipients(action, ticket):
            try:
                ph = person.phone_numbers.get(type__name=PhoneNumberType.CELL)
            except PhoneNumber.DoesNotExist:
                logger.info("Person: {person.id}; Fullname: {person.fullname} not sent SMS " \
                            "because has no CELL phone number on file, for SMS with body: {body}"
                            .format(person=person, body=action.content['body']))
            else:
                interpolate = Interpolate(ticket, person.locale.translation_, event=event)
                body = interpolate.text(action.content.get('body', ''))
                self.send_sms(ph, body)

    def send_sms(self, ph, body):
        """
        A generic method that sends an sms.
        """
        # if statement, so we're not sending SMS during a unittest run
        if settings.DEBUG:
            return true
        else:
            try:
                twilio_account_sid = os.environ['TWILIO_ACCOUNT_SID']
                twilio_auth_token = os.environ['TWILIO_AUTH_TOKEN']

                client = TwilioRestClient(twilio_account_sid, twilio_auth_token)

                body = "Ph:{}; Body:{}...".format(ph.number, body[:50])
                to = os.environ['TWILIO_NUMBER_TO']
                twilio_number = os.environ['TWILIO_NUMBER_FROM']

                msg = client.messages.create(
                    body=body,
                    to=to,
                    from_=twilio_number
                )
                print(msg.sid)
            except KeyError:
                # TODO: add logging - environment variables not configured
                pass
            except TwilioRestException:
                # TODO: add logging - twilio error
                pass


class PhoneNumber(BaseContactModel):
    """
    TODO: Will use this "phone number lib" for validation:

    https://github.com/daviddrysdale/python-phonenumbers
    """
    type = models.ForeignKey(PhoneNumberType, blank=True, null=True)
    number = models.CharField(max_length=100)

    objects = PhoneNumberManager()

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


class EmailManager(EmailAndSmsMixin, BaseManager):

    queryset_cls = EmailQuerySet

    def process_send_email(self, ticket, action, event):
        """
        Process the recipients on this Email Action, and if they're
        emailable, send them an email.

        :param ticket: Ticket instance being processed
        :param action:
            AutomationAction instance of Type "email" which has info
            about who to email and what to say
        :param event:
            AutomationEvent string name of the event that triggered
            the automation
        """
        Person = get_model_class("person")

        for person in self.get_recipients(action, ticket):

            for email in person.emails.filter(type__name=EmailType.WORK):
                interpolate = Interpolate(ticket, person.locale.translation_, event=event)

                subject = interpolate.text(action.content.get('subject', ''))

                context = {}
                raw_body = action.content.get('body', '')
                if interpolate.contains_ticket_activity(raw_body):
                    context.update({
                        'ticket_activity': True,
                        'ticket': ticket
                    })
                body = interpolate.text(raw_body)
                context['body'] = body

                # TODO: this base email template is hard coded at this
                # time. This should be configurable based on the Tenant
                html_base_template = os.path.join(settings.TEMPLATES_DIR,
                                     'email/test/base.html')
                html_content = interpolate.get_html_email(
                    html_base_template, **context)
                text_content = interpolate.get_text_email(
                    html_base_template, **context)

                self.send_email(email, subject, html_content=html_content,
                                text_content=text_content)

    def send_email(self, email, subject, html_content, text_content):
        """
        Generic method to send an email.
        """
        from_email, to = settings.EMAIL_HOST_USER, email.email
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
        msg.attach_alternative(html_content, "text/html")
        msg.send()


class Email(BaseContactModel):
    type = models.ForeignKey(EmailType, blank=True, null=True)
    email = models.EmailField()

    objects = EmailManager()

    class Meta:
        ordering = ('email',)
