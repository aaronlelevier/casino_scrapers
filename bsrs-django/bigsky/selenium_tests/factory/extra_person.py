from location.tests.factory import create_location_level, create_location
from person.tests.factory import create_single_person, create_role


ZAP_USERNAME = 'zap-person'


def setup_fake_role():
    location_level = create_location_level('xpt-location-level')
    location = create_location(location_level)
    role = create_role('wat-role', location_level)
    create_single_person(name=ZAP_USERNAME, role=role, location=location)
