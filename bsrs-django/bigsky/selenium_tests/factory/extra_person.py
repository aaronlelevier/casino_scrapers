from person.models import Person, Role
from location.models import LocationLevel

ZAP_USERNAME = 'zap-person'

def setup_fake_role():
    wat_location_level, _ = LocationLevel.objects.get_or_create(name='xpt-location-level')
    wat_role, _ = Role.objects.get_or_create(name='wat-role', location_level=wat_location_level)
    wat_person, _ = Person.objects.get_or_create(username=ZAP_USERNAME, role=wat_role)
