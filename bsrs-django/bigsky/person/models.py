import copy
from datetime import timedelta
from itertools import chain
import re

from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.auth.models import UserManager, Group, AbstractUser
from django.contrib.auth.hashers import make_password, identify_hasher
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import ArrayField
from django.db import models, IntegrityError
from django.db.models import F, Q
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from generic.models import Attachment
from accounting.models import Currency
from category.models import Category
from contact.models import PhoneNumber, Address, Email
from location.models import LocationLevel, Location, LOCATION_COMPANY
from person import config, helpers
from tenant.models import Tenant
from translation.models import Locale, Translation
from utils import classproperty
from utils.fields import InheritedValueField
from utils.models import (BaseModel, BaseManager, BaseManagerMixin, BaseQuerySet,
    BaseNameModel, DefaultNameManager)
from utils.validators import (contains_digit, contains_upper_char, contains_lower_char,
    contains_special_char, contains_no_whitespaces)
from work_order.models import WorkOrderStatus


class RoleQuerySet(BaseQuerySet):

    def search_multi(self, keyword):
        return self.filter(
            Q(name__icontains=keyword) | \
            Q(role_type__icontains=keyword)
        )

    def filter_export_data(self, query_params):
        qs = super(RoleQuerySet, self).filter_export_data(query_params)
        return qs.annotate(location_level_name=F('location_level__name'))


class RoleManager(BaseManager):

    queryset_cls = RoleQuerySet

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)


class Role(BaseModel):

    _RAW_EXPORT_FIELDS_AND_HEADERS = [
        ('name', 'admin.role.label.name'),
        ('role_type', 'admin.role.label.role_type'),
        ('location_level_name', 'admin.role.label.location_level')
    ]

    @classproperty
    def EXPORT_FIELDS(cls):
        return [x[0] for x in cls._RAW_EXPORT_FIELDS_AND_HEADERS]

    @classproperty
    def I18N_HEADER_FIELDS(cls):
        return [x[1] for x in cls._RAW_EXPORT_FIELDS_AND_HEADERS]

    # keys
    tenant = models.ForeignKey(Tenant, related_name="roles", null=True)
    group = models.OneToOneField(Group, blank=True, null=True)
    location_level = models.ForeignKey(LocationLevel, null=True, blank=True)
    role_type = models.CharField(max_length=29, blank=True,
        choices=[(x,x) for x in config.ROLE_TYPES], default=config.ROLE_TYPES[0])
    # Required
    name = models.CharField(max_length=75, unique=True, help_text="Will be set to the Group Name")
    categories = models.ManyToManyField(Category, blank=True)
    dashboard_text = models.CharField(max_length=255, null=True)
    create_all = models.BooleanField(blank=True, default=False,
        help_text='Allow document creation for all locations')
    modules = models.TextField(blank=True)
    dashboad_links = models.TextField(blank=True)
    tabs = models.TextField(blank=True)
    process_assign = models.BooleanField(default=True,
        help_text="If True, run the Ticket Automation Profiles after a Ticket is create, "
                  "but if False, assign to the Person who created the Ticket")
    # Password
    password_can_change = models.BooleanField(blank=True, default=True)
    password_min_length = models.PositiveIntegerField(blank=True, default=6)
    password_history_length = ArrayField(
        base_field=models.PositiveIntegerField(
            help_text="Will be NULL if password length has never been changed."),
        blank=True, default=[])

    password_digit_required = models.BooleanField(blank=True, default=False)
    password_lower_char_required = models.BooleanField(blank=True, default=False)
    password_upper_char_required = models.BooleanField(blank=True, default=False)
    password_special_char_required = models.BooleanField(blank=True, default=False)

    password_expire = models.IntegerField(blank=True, default=90,
      help_text="Number of days after setting password that it will expire."
                "If '0', password will never expire.")
    password_expire_alert = models.BooleanField(blank=True, default=True,
        help_text="Does the Person want to be alerted 'pre pw expiring'. "
                  "Alerts start 3 days before password expires.")
    password_expired_login_count = models.IntegerField(blank=True, null=True)
    # Proxy
    proxy_set = models.BooleanField(blank=True, default=False,
        help_text="Users in this Role can set their own proxy")
    # Auth Amounts
    auth_amount = models.DecimalField(
        max_digits=15, decimal_places=4, blank=True, null=True, default=0)
    auth_currency = models.ForeignKey(Currency, blank=True, null=True)
    # Approvals
    allow_approval = models.BooleanField(blank=True, default=False)
    proxy_approval_bypass = models.BooleanField(blank=True, default=False)
    # Work Orders
    wo_notes = models.BooleanField(blank=True, default=False)
    wo_edit_closeout = models.BooleanField(blank=True, default=False)
    wo_show_inactive = models.BooleanField(blank=True, default=False)
    wo_show_tkt_attach = models.BooleanField(blank=True, default=False)
    wo_allow_backdate = models.BooleanField(blank=True, default=False)
    wo_days_backdate = models.PositiveIntegerField(blank=True, null=True)
    # Invoices
    inv_options = models.CharField(max_length=255, choices=[(x,x) for x in config.INVOICE_TYPES],
                                   default=config.INVOICE_TYPES[0])
    inv_wo_status = models.ForeignKey(WorkOrderStatus, blank=True, null=True)
    inv_wait = models.PositiveIntegerField(blank=True, null=True)
    inv_select_assign = models.CharField(max_length=255, choices=[(x,x) for x in config.INVOICE_SELECT_ASSIGN_TYPES],
                                         default=config.INVOICE_SELECT_ASSIGN_TYPES[0])
    inv_autoapprove = models.BooleanField(blank=True, default=False)
    inv_max_approval_amount = models.PositiveIntegerField(
        blank=True, default=0)
    inv_max_approval_currency = models.CharField(
        max_length=25, blank=True, default='usd')
    inv_req_attach = models.BooleanField(blank=True, default=True)
    inv_close_wo = models.CharField(max_length=255, choices=[(x,x) for x in config.CLOSE_WO_ON_APPROVAL_TYPES],
                                    default=config.CLOSE_WO_ON_APPROVAL_TYPES[0])
    # Messages
    # TODO: are these "Email" or "SMS" messages, or any particular type?
    msg_address = models.BooleanField(blank=True, default=False,
        help_text="whether users in this role are allowed to change the CC field on a ticket or work order")
    msg_viewall = models.BooleanField(blank=True, default=False)
    msg_copy_email = models.BooleanField(blank=True, default=False)
    msg_copy_default = models.BooleanField(blank=True, default=False)
    msg_stored_link = models.BooleanField(blank=True, default=False)

    objects = RoleManager()

    __original_values = {}

    def __init__(self, *args, **kwargs):
        super(Role, self).__init__(*args, **kwargs)
        self.__original_values.update({
            'password_min_length': self.password_min_length
        })

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self._update_defaults()
        self._update_password_history_length()
        self._validate_related_categories()
        return super(Role, self).save(*args, **kwargs)

    @property
    def fullname(self):
        return self.name

    def inherited(self):
        return {
            'dashboard_text': self.proxy_dashboard_text,
            'auth_currency': self.proxy_auth_currency
        }

    proxy_dashboard_text = InheritedValueField('dashboard_text', [('tenant', 'dashboard_text')])
    proxy_auth_currency = InheritedValueField('auth_currency', [('tenant', 'default_currency')])

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "default": True if self.name == settings.DEFAULT_ROLE else False,
            "location_level": str(self.location_level.id) if self.location_level else None
        }

    def _update_defaults(self):
        if not self.group:
            try:
                self.group, _ = Group.objects.get_or_create(
                    name=self.name)
            except IntegrityError:
                raise

        if not self.auth_amount:
            self.auth_amount = 0

    def _update_password_history_length(self):
        """
        Append the previous ``password_min_length`` to the ``password_history_length``
        if the ``password_min_length`` has changed.
        """
        if self.password_min_length != self.__original_values['password_min_length']:
            self.password_history_length.append(
                self.__original_values['password_min_length'])
            self.__original_values[
                'password_min_length'] = self.password_min_length

    # Password Validators: start

    def run_password_validators(self, password):
        responses = []
        validators = [self._validate_contains_digit, self._validate_contains_upper_char,
            self._validate_contains_lower_char, self._validate_contains_special_char,
            self._validate_no_whitespaces]

        for validator in validators:
            responses.append(validator(password))

        if not all(responses):
            raise ValidationError(self._password_chars_error_message())

    def _validate_contains_digit(self, password):
        if self.password_digit_required:
            return contains_digit(password)
        return True

    def _validate_contains_upper_char(self, password):
        if self.password_upper_char_required:
            return contains_upper_char(password)
        return True

    def _validate_contains_lower_char(self, password):
        if self.password_lower_char_required:
            return contains_lower_char(password)
        return True

    def _validate_contains_special_char(self, password):
        if self.password_special_char_required:
            return contains_special_char(password)
        return True

    @staticmethod
    def _validate_no_whitespaces(password):
        return contains_no_whitespaces(password)

    def _password_chars_error_message(self):
        return "Required characters: {digit} {upper_char} {lower_char} {special_char}".format(
            digit = "0-9" if self.password_digit_required else "",
            upper_char = "A-Z" if self.password_upper_char_required else "",
            lower_char = "a-z" if self.password_lower_char_required else "",
            special_char = "$%!@" if self.password_special_char_required else ""
        )

    # Password Validators: end

    def _validate_related_categories(self):
        child_categories = []
        for category in self.categories.exclude(parent__isnull=True):
            child_categories.append(category.name)

        if child_categories:
            raise ValidationError("Role can't have related child categories: {}."
                                 .format(', '.join(child_categories)))

    @property
    def permissions(self):
        role_perms = (self.group.permissions.filter(codename__in=helpers.PermissionInfo.CODENAMES)
                                            .values_list('codename', flat=True))
        return {p:True for p in role_perms}


class ProxyRole(BaseModel):

    '''
    A `Role` that can proxy for, or act on the behalf of, another `Role`
    '''
    role = models.ForeignKey(Role)


class PersonStatus(BaseNameModel):

    default = config.PERSON_STATUSES[0]

    objects = DefaultNameManager()

    class Meta:
        verbose_name_plural = 'Person statuses'


class PersonQuerySet(BaseQuerySet):

    def search_multi(self, keyword):
        return self.filter(
            Q(username__icontains=keyword) | \
            Q(fullname__icontains=keyword) | \
            Q(title__icontains=keyword) | \
            Q(role__name__icontains=keyword)
        )

    def search_power_select(self, keyword):
        return self.filter(
            Q(username__icontains=keyword) | \
            Q(fullname__icontains=keyword) | \
            Q(email__icontains=keyword)
        )

    def filter_export_data(self, query_params):
        qs = super(PersonQuerySet, self).filter_export_data(query_params)
        return qs.annotate(status_name=F('status__name'),
                           role_name=F('role__name'))

    def get_sms_recipients(self, tenant, keyword):
        qs = (self.filter(role__tenant=tenant, phone_numbers__isnull=False)
                  .prefetch_related('phone_numbers'))

        if keyword:
            qs = qs.search_multi(keyword)

        return qs

    def get_email_recipients(self, tenant, keyword):
        qs = (self.filter(role__tenant=tenant, emails__isnull=False)
                  .prefetch_related('emails'))

        if keyword:
            qs = qs.search_multi(keyword)

        return qs

    def filter_by_ticket_location_and_role(self, ticket, role_ids):
        return self.filter(locations=ticket.location, role__id__in=role_ids)


class PersonManager(BaseManagerMixin, UserManager):
    '''
    Auto exclude deleted records
    '''

    # Leave as-is b/c not using our BaseManager, using Django's UserManager.
    # Don't use `queryset_cls` pattern for this class.
    def get_queryset(self):
        return PersonQuerySet(self.model, using=self._db).filter(deleted__isnull=True)

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)

    def search_power_select(self, keyword):
        return self.get_queryset().search_power_select(keyword)

    def get_sms_recipients(self, tenant, keyword=None):
        return self.get_queryset().get_sms_recipients(tenant, keyword)

    def get_email_recipients(self, tenant, keyword=None):
        return self.get_queryset().get_email_recipients(tenant, keyword)

    def filter_by_ticket_location_and_role(self, ticket, role_ids):
        return self.get_queryset().filter_by_ticket_location_and_role(ticket, role_ids)


class Person(BaseModel, AbstractUser):
    '''
    :pw: password
    :ooto: out-of-the-office
    '''
    MODEL_FIELDS = ['id', 'username']

    _RAW_EXPORT_FIELDS_AND_HEADERS = [
        ('status_name', 'admin.person.label.status'),
        ('fullname', 'admin.person.label.fullname'),
        ('username', 'admin.person.label.username'),
        ('title', 'admin.person.label.title'),
        ('role_name', 'admin.person.label.role-name')
    ]

    @classproperty
    def EXPORT_FIELDS(cls):
        return [x[0] for x in cls._RAW_EXPORT_FIELDS_AND_HEADERS]

    @classproperty
    def I18N_HEADER_FIELDS(cls):
        return [x[1] for x in cls._RAW_EXPORT_FIELDS_AND_HEADERS]

    # Keys
    role = models.ForeignKey(Role, related_name='people')
    status = models.ForeignKey(PersonStatus, blank=True, null=True)
    locations = models.ManyToManyField(
        Location, related_name='people', blank=True)
    locale = models.ForeignKey(Locale, blank=True, null=True,
                               help_text="If the Person has not 'Locale', the Accept-Language "
                               "header will be used or the Site's system setting.")
    # required
    # Auth Amounts - can be defaulted by the Role
    fullname = models.CharField(max_length=100, blank=True)
    auth_amount = models.DecimalField(max_digits=15, decimal_places=4, blank=True, null=True)
    auth_currency = models.ForeignKey(Currency, blank=True, null=True)
    next_approver = models.ForeignKey("self", related_name='nextapprover',
                                      blank=True, null=True)
    # optional
    employee_id = models.CharField(max_length=100, blank=True, null=True)
    middle_initial = models.CharField(max_length=1, blank=True, null=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    # Passwords
    password_length = models.PositiveIntegerField(blank=True, null=True,
                                                  help_text="Store the length of the current password.")
    password_expire_date = models.DateField(blank=True, null=True,
                                            help_text="Date that the Person's password will expire next. "
                                            "Based upon the ``password_expire`` days set on the Role.")
    password_one_time = models.BooleanField(blank=True, default=False)
    password_change = models.DateTimeField( blank=True, null=True,
        help_text="DateTime of last password change")
    password_history = ArrayField(
        models.CharField(max_length=254),
        blank=True, default=[], size=settings.MAX_PASSWORDS_STORED)
    # Out-of-the-Office
    proxy_status = models.CharField("Out of the Office Status", max_length=100,
                                    blank=True, null=True)
    proxy_start_date = models.DateField("Out of the Office Status Start Date",
                                        max_length=100, blank=True, null=True)
    proxy_end_date = models.DateField("Out of the Office Status End Date", max_length=100,
                                      blank=True, null=True)
    proxy_user = models.ForeignKey("self", related_name='coveringuser', blank=True, null=True)
    # Contact Models
    phone_numbers = GenericRelation(PhoneNumber)
    addresses = GenericRelation(Address)
    emails = GenericRelation(Email)

    def inherited(self):
        return {
            'auth_amount': self.proxy_auth_amount,
            'auth_currency': self.proxy_auth_currency
        }

    # proxy fields (won't create a field in the database)
    proxy_auth_amount = InheritedValueField('auth_amount', [('role', 'auth_amount')])
    proxy_auth_currency = InheritedValueField('auth_currency',
                                              [('role', 'auth_currency'), ('tenant', 'default_currency')])
    photo = models.ForeignKey(Attachment, null=True)

    # Managers
    objects = PersonManager()
    objects_all = UserManager()

    class Meta:
        verbose_name_plural = 'People'
        ordering = ("fullname",)

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        self._update_defaults()
        self._validate_locations()
        self._update_max_passwords_history()
        return super(Person, self).save(*args, **kwargs)

    def to_dict(self, locale):
        locations = [{'id': str(x.id), 'name': x.name, 'status_fk': str(x.status.id),
            'location_level': str(x.location_level.id), 'number': x.number} for x in self.locations.all()]

        return {
            'id': str(self.id),
            'first_name': self.first_name,
            'middle_initial': self.middle_initial,
            'last_name': self.last_name,
            'username': self.username,
            'title': self.title,
            'employee_id': self.employee_id,
            'locale': str(self.locale.id if self.locale else self._get_locale(locale)),
            'role': str(self.role.id),
            'tenant': str(self.role.tenant.id),
            'locations': locations,
            'status_fk': str(self.status.id),
            'inherited': self.inherited()
        }

    def to_simple_dict(self):
        return {
            'id': str(self.id),
            'first_name': self.first_name,
            'middle_initial': self.middle_initial,
            'last_name': self.last_name
        }

    def to_simple_fullname_dict(self):
        from person.serializers import PersonTicketListSerializer
        return PersonTicketListSerializer(self).data

    def _get_locale(self, locale):
        '''
        Only returns one locale based on last locale in list of languages (en,en-US)
        checks a Locale object with a locale of en-US
        Returns system default if no language for browser detected language
        re.findall(r"([\w\-]+;q=\d\.\d)+", "en,en-US;q=0.9,zh;q=0.4")
        >> ['en-US;q=0.9', 'zh;q=0.4']
        '''
        try:
            locales = re.findall(r'([\w\-]+;q=\d\.\d)+', locale)
            for locale in locales:
                locale = locale.split(';')[0]
                try:
                    return str(Locale.objects.get(locale=locale).id)
                except Locale.DoesNotExist:
                    pass
        except (AttributeError, TypeError):
            pass

        return str(Locale.objects.system_default().id)

    @property
    def translation_values(self):
        try:
            return Translation.objects.get(locale=self.locale).values
        except Translation.DoesNotExist:
            return {}

    @property
    def _password_expire_date(self):
        return timezone.now().date() + timedelta(days=self.role.password_expire)

    def set_password(self, raw_password):
        """
        Check if the raw_password has been used before. If so, raise an
        error. If not, update password, and append the password hash to
        the list of password_history for this Person.
        """
        new_password = make_password(raw_password)
        hasher = identify_hasher(new_password)

        if not self.password:
            self.password_history = []

        if not self.password_history:
            self.password_history.append(new_password)
        else:
            if any([hasher.verify(raw_password, p) for p in self.password_history]):
                raise ValidationError("User: {}, the password:'{}' has already "
                                "been used.".format(self.username, raw_password))

        super(Person, self).set_password(raw_password)

        if new_password not in self.password_history:
            self.password_history.append(new_password)

        self.password_change = timezone.now()

    def _update_defaults(self):
        if not self.status:
            self.status = PersonStatus.objects.default()
        if not self.locale:
            self.locale = Locale.objects.system_default()
        if not self.password_expire_date:
            self.password_expire_date = self._password_expire_date

        self.fullname = self.get_full_name()

    def get_full_name(self):
        names = [self.first_name, self.last_name]
        if self.middle_initial:
            names.insert(1, self.formatted_middle_initial)
        return ' '.join(names)

    @property
    def formatted_middle_initial(self):
        if self.middle_initial:
            return "{}.".format(self.middle_initial)

    def _validate_locations(self):
        """
        Remove invalid Locations from the Person based on
        their Role.location_level.
        """
        for l in self.locations.all():
            if l.location_level != self.role.location_level:
                self.locations.remove(l)
                raise ValidationError("{} != {}"
                    .format(l.location_level, self.role.location_level))

    def _update_max_passwords_history(self):
        if len(self.password_history) > settings.MAX_PASSWORDS_STORED:
            setattr(self, 'password_history',
                self.password_history[len(self.password_history)-settings.MAX_PASSWORDS_STORED:])

    def all_locations_and_children(self):
        ids = self.locations.objects_and_their_children()
        return [{'id': str(x.id), 'name': x.name, 'location_level': str(x.location_level.id), 'status': str(x.status.id)}
               for x in Location.objects.filter(id__in=ids)]

    def categories(self):
        return [{'id': str(x.id), 'name': x.name} for x in self.role.categories.all()]

    @property
    def has_top_level_location(self):
        """
        Return a `Bool` if the Person has the Top Level Location.
        """
        return LOCATION_COMPANY in self.locations.values_list('name', flat=True)


@receiver(post_save, sender=Person)
def update_group(sender, instance=None, created=False, **kwargs):
    "Post-save hook for maintaing single Group enrollment."
    helpers.update_group(person=instance, group=instance.role.group)


class PersonAndRole(object):
    """
    Class to provide methods for Person/Role. i.e. UNION'd lists.
    """
    @classmethod
    def email_recipients(cls, tenant, keyword=''):
        """
        Return a UNION'd list of Person/Role records that are Email'able

        :param tenant: related Tenant instance of the requesting Person
        :param keyword: optional search string
        """
        person_list = Person.objects.get_email_recipients(tenant).search_multi(keyword)
        role_list = Role.objects.filter(tenant=tenant).search_multi(keyword)

        result_list = list(chain(person_list, role_list))[:settings.PAGE_SIZE]

        return [{'id': str(x.id), 'fullname': x.fullname, 'type': x.__class__.__name__.lower()}
                for x in result_list]

    @classmethod
    def sms_recipients(cls, tenant, keyword=''):
        """
        Return a UNION'd list of Person/Role records that are SMS'able

        :param tenant: related Tenant instance of the requesting Person
        :param keyword: optional search string
        """
        person_list = Person.objects.get_sms_recipients(tenant).search_multi(keyword)
        role_list = Role.objects.filter(tenant=tenant).search_multi(keyword)

        result_list = list(chain(person_list, role_list))[:settings.PAGE_SIZE]

        return [{'id': str(x.id), 'fullname': x.fullname, 'type': x.__class__.__name__.lower()}
                for x in result_list]
