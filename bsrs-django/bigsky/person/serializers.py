from rest_framework import serializers

from category.serializers import CategoryIDNameOnlySerializer, CategoryRoleSerializer
from contact.serializers import PhoneNumberSerializer, EmailSerializer, AddressSerializer
from location.serializers import LocationIdNameOnlySerializer, LocationStatusFKSerializer
from person.models import Person, Role, PersonStatus
from person.validators import RoleLocationValidator, RoleCategoryValidator
from utils.serializers import (BaseCreateSerializer, NestedContactSerializerMixin,
    RemovePasswordSerializerMixin)


### ROLE ###

ROLE_LIST_FIELDS = ('id', 'name', 'role_type', 'location_level')

ROLE_DETAIL_FIELDS = ROLE_LIST_FIELDS + ('auth_currency', 'auth_amount', 'categories',)

ROLE_CREATE_UPDATE_FIELDS = ROLE_LIST_FIELDS + \
    ('auth_currency', 'auth_amount', 'dashboard_text', 'categories',)


class RoleListSerializer(BaseCreateSerializer):

    class Meta:
        model = Role
        fields = ROLE_LIST_FIELDS


class RoleCreateSerializer(BaseCreateSerializer):

    class Meta:
        model = Role
        validators = [RoleCategoryValidator()]
        fields = ROLE_CREATE_UPDATE_FIELDS


class RoleUpdateSerializer(BaseCreateSerializer):

    class Meta:
        model = Role
        validators = [RoleCategoryValidator()]
        fields = ROLE_CREATE_UPDATE_FIELDS


class RoleDetailSerializer(BaseCreateSerializer):
    """
    Fields that have the ability to be inherited are not represented as first level
    fields in the detail payload. Instead they are nested within an ``inherited``
    object. Each is an object with inherited properties.
    """
    categories = CategoryRoleSerializer(many=True)

    class Meta:
        model = Role
        fields = ROLE_DETAIL_FIELDS + ('inherited',)

    @staticmethod
    def eager_load(queryset):
        return queryset.prefetch_related('categories')


class RoleIdNameSerializer(serializers.ModelSerializer):
    "Used for nested serializer data for other serializers."

    class Meta:
        model = Role
        fields = ('id', 'name',)


### PERSON ###

PERSON_FIELDS = ('id', 'username', 'first_name', 'middle_initial', 'last_name',
                 'fullname', 'role', 'title')

PERSON_DETAIL_FIELDS = PERSON_FIELDS + ('employee_id', 'locale', 'locations', 'emails', 'phone_numbers',
                                        'addresses', 'password_one_time',)

PERSON_DETAIL_FIELDS_WITH_STATUS = PERSON_DETAIL_FIELDS + ('status',)


class PersonCreateSerializer(RemovePasswordSerializerMixin, BaseCreateSerializer):
    '''
    Base Create serializer because ``Role`` needed before second step
    of configuration for the ``Person``.
    '''
    class Meta:
        model = Person
        write_only_fields = ('password',)
        fields = ('id', 'username', 'first_name', 'middle_initial', 'last_name',
                  'password', 'role', 'locale',)

    def create(self, validated_data):
        person = super(PersonCreateSerializer, self).create(validated_data)
        person.groups.add(person.role.group)
        return person


class PersonStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = PersonStatus
        fields = ('id', 'name')


class PersonListSerializer(serializers.ModelSerializer):

    status = PersonStatusSerializer(required=False)

    class Meta:
        model = Person
        fields = PERSON_FIELDS + ('status',)


class PersonSearchSerializer(serializers.ModelSerializer):

    class Meta:
        model = Person
        fields = ('id', 'fullname', 'username', 'email')


class PersonTicketSerializer(serializers.ModelSerializer):

    class Meta:
        model = Person
        fields = ('id', 'first_name', 'middle_initial', 'last_name', 'status', 'role')


class PersonTicketListSerializer(serializers.ModelSerializer):
    # Role and Status is not needed in Ticket Grid
    class Meta:
        model = Person
        fields = ('id', 'fullname',)


class PersonDetailSerializer(serializers.ModelSerializer):

    locations = LocationStatusFKSerializer(many=True)
    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)
    status_fk = serializers.PrimaryKeyRelatedField(queryset=PersonStatus.objects.all(), source='status')

    class Meta:
        model = Person
        fields = PERSON_DETAIL_FIELDS + ('status_fk', 'last_login', 'date_joined', 'inherited',)

    @staticmethod
    def eager_load(queryset):
        return (queryset.select_related('role')
                        .prefetch_related('emails', 'phone_numbers', 'addresses',
                                          'locations', 'locations__location_level'))


class PersonCurrentSerializer(PersonDetailSerializer):

    all_locations_and_children = LocationIdNameOnlySerializer(many=True)
    categories = CategoryIDNameOnlySerializer(many=True)

    class Meta:
        model = Person
        fields = PERSON_DETAIL_FIELDS_WITH_STATUS + ('all_locations_and_children',
                                         'categories',)


class PersonUpdateSerializer(RemovePasswordSerializerMixin, NestedContactSerializerMixin,
    serializers.ModelSerializer):
    '''
    Update a ``Person`` and all nested related ``Contact`` Models.

    :Location constraint:
        A Person's Location can only be:

        `person.location.location_level == person.role.location.location_level`
    '''
    password = serializers.CharField(required=False, style={'input_type': 'password'})
    emails = EmailSerializer(required=False, many=True)
    phone_numbers = PhoneNumberSerializer(required=False, many=True)
    addresses = AddressSerializer(required=False, many=True)

    class Meta:
        model = Person
        validators = [RoleLocationValidator('role', 'locations')]
        write_only_fields = ('password',)
        fields = PERSON_DETAIL_FIELDS_WITH_STATUS + ('auth_amount', 'auth_currency', 'password')

    def update(self, instance, validated_data):
        # Pasword
        self._update_password(instance, validated_data)
        # Contacts
        return super(PersonUpdateSerializer, self).update(instance, validated_data)

    def _update_password(self, instance, validated_data):
        raw_password = validated_data.pop('password', None)
        if raw_password:
            instance.set_password(raw_password)
