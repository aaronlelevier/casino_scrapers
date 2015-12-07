from person.models import Person, Role
from location.models import LocationLevel


def setup_fake_role():
    wat_location_level, _ = LocationLevel.objects.get_or_create(name='xpt-location-level')
    wat_role, _ = Role.objects.get_or_create(name='wat-role', location_level=wat_location_level)
    wat_person, _ = Person.objects.get_or_create(username='zap-person', role=wat_role)
