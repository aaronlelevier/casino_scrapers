from contact.models import (PhoneNumber, PhoneNumberType, Email, EmailType,
    Address, AddressType, PHONE_NUMBER_TYPES, EMAIL_TYPES, ADDRESS_TYPES)


def create_phone_numbers(domino_location, related_instance):
    ph_types = PhoneNumberType.objects.all()

    if domino_location.telephone:
        ph_type = ph_types.get(name='telephone')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.telephone, type=ph_type)

    if domino_location.carphone:
        ph_type = ph_types.get(name='cell')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.carphone, type=ph_type)

    if domino_location.fax:
        ph_type = ph_types.get(name='fax')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.fax, type=ph_type)


def create_email(domino_location, related_instance):
    email_type = EmailType.objects.get('location')
    Email.objects.create(content_object=related_instance,
        object_id=related_instance.id, email=domino_location.email,
        type=email_type)
