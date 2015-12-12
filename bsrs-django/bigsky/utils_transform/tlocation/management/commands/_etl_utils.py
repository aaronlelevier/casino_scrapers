from contact.models import PhoneNumber, PhoneNumberType

def create_phone_numbers(domino_location, related_instance):
    ph_types = PhoneNumberType.objects.all()

    if domino_location.telephone:
        ph_type = ph_types.get(name='telephone')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.telephone, type=ph_type)

    if domino_location.carphone:
        ph_type = ph_types.get(name='carphone')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.carphone, type=ph_type)

    if domino_location.fax:
        ph_type = ph_types.get(name='fax')
        PhoneNumber.objects.create(content_object=related_instance, object_id=related_instance.id,
            number=domino_location.fax, type=ph_type)
