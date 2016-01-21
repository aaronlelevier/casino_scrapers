import re
from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.auth.models import UserManager, Group, AbstractUser
from django.contrib.auth.hashers import make_password, identify_hasher
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models, IntegrityError
from django.db.models.signals import post_save
from django.db.models import Q
from django.dispatch import receiver
from django.utils import timezone

from accounting.models import Currency
from contact.models import PhoneNumber, Address, Email
from location.models import LocationLevel, Location
from category.models import Category
from person import helpers
from translation.models import Locale
from utils import choices
from utils.models import BaseModel, BaseStatusModel, BaseStatusManager
from utils.validators import (contains_digit, contains_upper_char, contains_lower_char,
    contains_special_char, contains_no_whitespaces)
from work_order.models import WorkOrderStatus


class Role(BaseModel):
    # keys
    group = models.OneToOneField(Group, blank=True, null=True)
    location_level = models.ForeignKey(LocationLevel, null=True, blank=True)
    role_type = models.CharField(max_length=29, blank=True,
        choices=choices.ROLE_TYPE_CHOICES, default=choices.ROLE_TYPE_CHOICES[0][0])
    # Required
    name = models.CharField(max_length=75, unique=True, help_text="Will be set to the Group Name")
    categories = models.ManyToManyField(Category, blank=True) 
    dashboad_text = models.CharField(max_length=255, blank=True)
    create_all = models.BooleanField(blank=True, default=False,
        help_text='Allow document creation for all locations')
    modules = models.TextField(blank=True)
    dashboad_links = models.TextField(blank=True)
    tabs = models.TextField(blank=True)
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
    # Default Settings
    # that set the Person settings for these fields when first
    # adding a Person to a Role
    default_accept_assign = models.BooleanField(blank=True, default=True)
    accept_assign = models.BooleanField(blank=True, default=False)
    default_accept_notify = models.BooleanField(blank=True, default=True)
    accept_notify = models.BooleanField(blank=True, default=False)
    # Auth Amounts
    default_auth_amount = models.DecimalField(
        max_digits=15, decimal_places=4, blank=True, default=0)
    default_auth_currency = models.ForeignKey(Currency, blank=True, null=True)
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
    inv_options = models.CharField(max_length=255, choices=choices.INVOICE_CHOICES,
                                   default=choices.INVOICE_CHOICES[0][0])
    inv_wo_status = models.ForeignKey(WorkOrderStatus, blank=True, null=True)
    inv_wait = models.PositiveIntegerField(blank=True, null=True)
    inv_select_assign = models.CharField(max_length=255, choices=choices.INVOICE_SELECT_ASSIGN_CHOICES,
                                         default=choices.INVOICE_SELECT_ASSIGN_CHOICES[0][0])
    inv_autoapprove = models.BooleanField(blank=True, default=False)
    inv_max_approval_amount = models.PositiveIntegerField(
        blank=True, default=0)
    inv_max_approval_currency = models.CharField(
        max_length=25, blank=True, default='usd')
    inv_req_attach = models.BooleanField(blank=True, default=True)
    inv_close_wo = models.CharField(max_length=255, choices=choices.CLOSE_WO_ON_APPROVAL_CHOICES,
                                    default=choices.CLOSE_WO_ON_APPROVAL_CHOICES[0][0])
    # Messages
    # TODO: are these "Email" or "SMS" messages, or any particular type?
    msg_address = models.BooleanField(blank=True, default=False,
        help_text="whether users in this role are allowed to change the CC field on a ticket or work order")
    msg_viewall = models.BooleanField(blank=True, default=False)
    msg_copy_email = models.BooleanField(blank=True, default=False)
    msg_copy_default = models.BooleanField(blank=True, default=False)
    msg_stored_link = models.BooleanField(blank=True, default=False)

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
        return super(Role, self).save(*args, **kwargs)

    @property
    def _name(self):
        return self.__name__.lower()

    def to_dict(self):
        if not self.location_level:
            return {
                "id": str(self.pk),
                "name": self.name
            }
        else:
            return {
                "id": str(self.pk),
                "name": self.name,
                "location_level": str(self.location_level.id),
                "default": True if self.name == settings.DEFAULT_ROLE else False
            }

    def _update_defaults(self):
        if not self.group:
            try:
                self.group, _ = Group.objects.get_or_create(
                    name=self.name)
            except IntegrityError:
                raise

        if not self.default_auth_currency:
            self.default_auth_currency = Currency.objects.default()

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


class ProxyRole(BaseModel):

    '''
    A `Role` that can proxy for, or act on the behalf of, another `Role`
    '''
    role = models.ForeignKey(Role)


class PersonStatusManager(BaseStatusManager):

    def get_or_create_default(self):
        return self.get_or_create(name=choices.PERSON_STATUS_CHOICES[0][0], default=True)


class PersonStatus(BaseStatusModel):

    objects = PersonStatusManager()

    def save(self, *args, **kwargs):
        if self.default:
            PersonStatus.objects.update_non_defaults(self.id)
        return super(PersonStatus, self).save(*args, **kwargs)


class PersonQuerySet(models.query.QuerySet):
    
    def search_multi(self, keyword):
        return self.filter(
            Q(username__icontains=keyword) | \
            Q(fullname__icontains=keyword) | \
            Q(title__icontains=keyword) | \
            Q(role__name__icontains=keyword)
        )


class PersonManager(UserManager):

    '''
    Auto exclude deleted records
    '''

    def get_queryset(self):
        return PersonQuerySet(self.model, using=self._db).filter(deleted__isnull=True)

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)


class Person(BaseModel, AbstractUser):
    '''
    :pw: password
    :ooto: out-of-the-office
    '''
    # Keys
    role = models.ForeignKey(Role)
    status = models.ForeignKey(PersonStatus, blank=True, null=True)
    locations = models.ManyToManyField(
        Location, related_name='people', blank=True)
    locale = models.ForeignKey(Locale, blank=True, null=True,
                               help_text="If the Person has not 'Locale', the Accept-Language "
                               "header will be used or the Site's system setting.")
    # required
    # Auth Amounts - can be defaulted by the Role
    fullname = models.CharField(max_length=50, blank=True)
    auth_amount = models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0)
    auth_currency = models.ForeignKey(Currency, blank=True, null=True)
    accept_assign = models.BooleanField(default=True, blank=True)
    accept_notify = models.BooleanField(default=True, blank=True)
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
    password_one_time = models.CharField(max_length=255, blank=True, null=True)
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

    # TODO: add logs for: user_history

    phone_numbers = GenericRelation(PhoneNumber)
    addresses = GenericRelation(Address)
    emails = GenericRelation(Email)

    # Managers
    objects = PersonManager()
    objects_all = UserManager()

    class Meta:
        ordering = ('fullname',)

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        self._update_defaults()
        self._validate_locations()
        self._update_max_passwords_history()
        return super(Person, self).save(*args, **kwargs)

    def to_dict(self, locale):
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
            'all_locations_and_children': [{'id': str(x.id), 'name': x.name, 'location_level': str(x.location_level.id), 'status': str(x.status.id) }
                                          for x in self.all_locations_and_children()],
            'all_role_categories_and_children': self.all_role_categories_and_children(),
        }

    def to_simple_dict(self):
        return {
            'id': str(self.id),
            'first_name': self.first_name,
            'middle_initial': self.middle_initial,
            'last_name': self.last_name
        }

    def to_simple_fullname_dict(self):
        return {
            'id': str(self.id),
            'fullname': self.fullname
        }

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

    def _get_locale(self, locale):
        """Resolve the Locale using the Accept-Language Header. If not 
        found, use the system default Locale.

        :locale: Accept-Language Header (string)
        """
        try:
            locales = re.match(r'[\w\_\-\,]+', locale).group()
            for locale in locales.split(','):
                try:
                    return str(Locale.objects.get(locale__iexact=locale).id)
                except Locale.DoesNotExist:
                    pass
        except (AttributeError, TypeError):
            pass

        return str(Locale.objects.system_default().id)

    def _update_defaults(self):
        if not self.status:
            self.status, _ = PersonStatus.objects.get_or_create_default()
        if not self.auth_amount:
            self.auth_amount = self.role.default_auth_amount
        if not self.auth_currency:
            self.auth_currency = self.role.default_auth_currency
        if not self.password_expire_date:
            self.password_expire_date = self._password_expire_date

        self.fullname = self.first_name + ' ' + self.last_name

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
        return Location.objects.filter(id__in=ids)

    def all_role_categories_and_children(self):
        return [str(x) for x in self.role.categories.objects_and_their_children()]


@receiver(post_save, sender=Person)
def update_group(sender, instance=None, created=False, **kwargs):
    "Post-save hook for maintaing single Group enrollment."
    helpers.update_group(person=instance, group=instance.role.group)
