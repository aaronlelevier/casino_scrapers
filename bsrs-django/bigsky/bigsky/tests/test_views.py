from datetime import timedelta
import json
import time

from django.conf import settings
from django.core.urlresolvers import reverse
from django.test import TestCase
from django.utils import timezone

from model_mommy import mommy

from accounting.models import Currency
from category.models import Category
from category.tests.factory import create_categories
from contact.models import State, Country, PhoneNumberType, AddressType, EmailType
from generic.models import SavedSearch
from location.models import LocationLevel, LocationStatus
from person.models import PersonStatus, Role
from person.tests.factory import PASSWORD, create_person, create_single_person, create_role
from ticket.models import TicketStatus, TicketPriority
from translation.models import Locale
from translation.tests.factory import create_locales


class IndexTests(TestCase):

    def setUp(self):
        create_categories()
        self.person = create_person()

    def test_logged_in(self):
        self.client.login(username=self.person.username, password=PASSWORD)
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)

    def test_logged_out_redirect(self):
        response = self.client.get(reverse('index'))
        self.assertRedirects(response, reverse('login')+'?next='+reverse('index'))

    def test_password_change_get(self):
        self.client.login(username=self.person.username, password=PASSWORD)
        response = self.client.get(reverse('password_change'))
        self.assertEqual(response.status_code, 200)

    def test_password_change_post(self):
        self.client.login(username=self.person.username, password=PASSWORD)
        new_password = "my-new-password"
        response = self.client.post(reverse('password_change'),
            {'old_password': PASSWORD, 'new_password1': new_password,
            'new_password2': new_password})
        self.assertRedirects(response, reverse('index'))
        self.assertIn('_auth_user_id', self.client.session)

    def test_password_expired(self):
        self.person.password_expire_date = timezone.now().date() - timedelta(days=1)
        self.person.save()
        self.client.login(username=self.person.username, password=PASSWORD)
        response = self.client.get(reverse('index'))
        self.assertRedirects(response, reverse('password_change')+'?next='+reverse('index'))


class LoginTests(TestCase):

    def setUp(self):
        create_categories()
        self.person = create_person()

    def test_login_unauthenticated(self):
        response = self.client.get(reverse('login'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['submit_button'], 'Login')

    def test_login_authenticated(self):
        self.client.login(username=self.person.username, password=PASSWORD)
        response = self.client.get(reverse('login'))
        self.assertRedirects(response, settings.LOGIN_REDIRECT_URL)

    def test_post(self):
        data = {'username': self.person.username, 'password': PASSWORD}
        response = self.client.post(reverse('login'), data, follow=True)
        self.assertRedirects(response, reverse('index'))

    def test_post_form_errors(self):
        data = {'username': self.person.username, 'password': "this isn't my password"}
        response = self.client.post(reverse('login'), data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.context['form'].non_field_errors)

    def test_favicon_and_media_url(self):
        response = self.client.get(reverse('login'))
        self.assertIn("{}images/favicon.ico".format(settings.MEDIA_URL), response.content.decode('utf8'))


class LogoutTests(TestCase):
    # Only a POST or PUT will be accepted request types to logout a Person

    def setUp(self):
        create_categories()
        self.person = create_person()

    def test_logout_post(self):
        self.client.login(username=self.person.username, password=PASSWORD)
        self.assertIn('_auth_user_id', self.client.session)
        self.client.post(reverse('logout'))
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_logout_put(self):
        self.client.login(username=self.person.username, password=PASSWORD)
        self.assertIn('_auth_user_id', self.client.session)
        self.client.put(reverse('logout'))
        self.assertNotIn('_auth_user_id', self.client.session)

    def test_logout_wrong_request(self):
        self.client.login(username=self.person.username, password=PASSWORD)
        self.assertIn('_auth_user_id', self.client.session)
        response = self.client.get(reverse('logout'))
        self.assertEqual(response.status_code, 404)
        self.assertIn('_auth_user_id', self.client.session)


class BootstrappedDataTests(TestCase):

    def setUp(self):
        create_categories()
        self.person = create_person()
        self.phone_number_types = mommy.make(PhoneNumberType)
        self.location_levels = mommy.make(LocationLevel, name='Base')
        self.location_level_child = mommy.make(LocationLevel, name='Child')
        self.location_level_parent = mommy.make(LocationLevel, name='Parent', children=[self.location_levels])
        self.location_levels.children.add(self.location_level_child)
        self.location_levels.parents.add(self.location_level_parent)
        self.location_levels.save()
        self.location_statuses = mommy.make(LocationStatus)
        LocationStatus.objects.default()
        self.person_status = mommy.make(PersonStatus)
        self.ticket_status = mommy.make(TicketStatus)
        TicketStatus.objects.default()
        self.ticket_priority = mommy.make(TicketPriority)

        categories = Category.objects.order_by("-parent")
        self.parent_category = categories[0]
        self.child_category = categories[1]
        self.child_category.parent = self.parent_category
        self.child_category.save()
        
        self.saved_search = mommy.make(SavedSearch, person=self.person, name="foo",
            endpoint_name="admin.people.index")

        mommy.make(EmailType)
        mommy.make(AddressType)
        mommy.make(State)
        mommy.make(Country)
        create_locales()
        
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

        self.response = self.client.get(reverse('index'))

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        self.assertEqual(self.response.status_code, 200)

    def test_email_types(self):
        data = json.loads(self.response.context['email_types_config'])

        obj = EmailType.objects.get(id=data[0]['id'])
        self.assertEqual(obj.name, data[0]['name'])

    def test_phone_number_types(self):
        data = json.loads(self.response.context['phone_number_types_config'])

        obj = PhoneNumberType.objects.get(id=data[0]['id'])
        self.assertEqual(obj.name, data[0]['name'])

    def test_address_types(self):
        data = json.loads(self.response.context['address_types'])

        obj = AddressType.objects.get(id=data[0]['id'])
        self.assertEqual(obj.name, data[0]['name'])

    def test_states_us(self):
        data = json.loads(self.response.context['states_us'])

        obj = State.objects.get(id=data[0]['id'])
        self.assertEqual(obj.name, data[0]['name'])
        self.assertEqual(obj.abbr, data[0]['abbr'])

    def test_countries(self):
        data = json.loads(self.response.context['countries'])

        obj = Country.objects.get(id=data[0]['id'])
        self.assertEqual(obj.name, data[0]['name'])

    def test_roles(self):
        configuration = json.loads(self.response.context['role_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertIn(str(self.person.role.id), [c["id"] for c in configuration])
        self.assertIn(str(self.person.role.name), [c["name"] for c in configuration])
        self.assertIn(str(self.person.role.location_level.id), [c["location_level"] for c in configuration])
        # role (non-default)
        role = Role.objects.first()
        role.location_level = None
        role.save()
        response = self.client.get(reverse('index'))
        configuration = json.loads(response.context['role_config'])
        self.assertTrue(len(configuration) > 0)
        self.assertIn(str(role.id), [c["id"] for c in configuration])
        self.assertFalse([c["default"] for c in configuration if c["name"] == settings.DEFAULT_ROLE])
        
    def test_role_types(self):
        configuration = json.loads(self.response.context['role_types_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertEqual("Internal", configuration[0])
        self.assertEqual("Third Party", configuration[1])

    def test_role__default_name_bool_and_location_level(self):
        [r.delete() for r in Role.objects.all()]
        role = mommy.make(Role, name='foo')
        self.assertIsNone(role.location_level)
        self.assertNotEqual(role.name, settings.DEFAULT_ROLE)

        response = self.client.get(reverse('index'))
        data = json.loads(response.context['role_config'])

        self.assertEqual(1, len(data))
        self.assertFalse(data[0]['default'])
        self.assertIsNone(data[0]['location_level'])

    def test_person_statuses(self):
        configuration = json.loads(self.response.context['person_status_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertIn(str(self.person_status.id), [c['id'] for c in configuration])
        self.assertIn(str(self.person_status.name), [c['name'] for c in configuration])

    def test_location_level(self):
        configuration = json.loads(self.response.context['location_level_config'])
        self.assertTrue(len(configuration) > 0)
        # the model id shows in the context
        self.assertIn(str(self.location_levels.id), [c['id'] for c in configuration])
        self.assertIn(str(self.location_levels.name), [c['name'] for c in configuration])
        children = [c['children'] for c in configuration]
        parents = [c['parents'] for c in configuration]
        self.assertIn(str(self.location_levels.children.first().id), [item for sublist in children for item in sublist])
        self.assertIn(str(self.location_levels.parents.first().id), [item for sublist in parents for item in sublist])

    def test_location_status(self):
        configuration = json.loads(self.response.context['location_status_config'])
        self.assertIn(
            True,
            [x['default'] for x in configuration]
        )

    def test_locales(self):
        data = json.loads(self.response.context['locales'])

        locale = Locale.objects.get(id=data[0]['id'])
        self.assertIsInstance(locale, Locale)
        self.assertEqual(locale.locale, data[0]['locale'])
        self.assertEqual(locale.name, data[0]['name'])
        self.assertEqual(locale.native_name, data[0]['native_name'])
        self.assertEqual(locale.presentation_name, data[0]['presentation_name'])
        self.assertEqual(locale.rtl, data[0]['rtl'])

    def test_currency(self):
        currency = Currency.objects.default()
        configuration = json.loads(self.response.context['currencies'])
        # test
        self.assertTrue(len(configuration) > 0)
        usd = configuration[currency.code]
        self.assertTrue(usd)
        self.assertEqual(usd['name'], currency.name)
        self.assertEqual(usd['name_plural'], currency.name_plural)
        self.assertEqual(usd['code'], currency.code)
        self.assertEqual(usd['symbol'], currency.symbol)
        self.assertEqual(usd['symbol_native'], currency.symbol_native)
        self.assertEqual(usd['decimal_digits'], currency.decimal_digits)
        self.assertEqual(usd['rounding'], currency.rounding)

    def test_person_current(self):
        Currency.objects.default()
        data = json.loads(self.response.context['person_current'])
        self.assertEqual(data['id'], str(self.person.id))
        self.assertEqual(data['first_name'], self.person.first_name)
        self.assertEqual(data['middle_initial'], self.person.middle_initial)
        self.assertEqual(data['last_name'], self.person.last_name)
        self.assertEqual(data['username'], self.person.username)
        self.assertEqual(data['title'], self.person.title)
        self.assertEqual(data['employee_id'], self.person.employee_id)
        self.assertEqual(data['locale'], str(self.person.locale.id))
        self.assertEqual(data['role'], str(self.person.role.id))
        self.assertEqual(data['status'], str(self.person.status.id))

    def test_default_model_ordering(self):
        # Note: this is a Dict Object generated off off URL's and the models,
        # so just assert True here
        data = json.loads(self.response.context['default_model_ordering'])
        self.assertTrue(len(data) > 0)

    def test_saved_search(self):
        data = json.loads(self.response.context['saved_search'])

        saved_search = SavedSearch.objects.filter(person=self.person)[0]
        self.assertEqual(str(saved_search.id), data[0]['id'])
        self.assertEqual(saved_search.name, data[0]['name'])
        self.assertEqual(saved_search.endpoint_name, data[0]['endpoint_name'])
        self.assertEqual(saved_search.endpoint_uri, data[0]['endpoint_uri'])

    def test_ticket_statuses(self):
        data = json.loads(self.response.context['ticket_statuses'])
        self.assertTrue(len(data) > 0)
        self.assertIn(str(self.ticket_status.id), [c['id'] for c in data])
        self.assertIn(str(self.ticket_status.name), [c['name'] for c in data])
        self.assertTrue([c['default'] for c in data])

    def test_ticket_priorities(self):
        data = json.loads(self.response.context['ticket_priorities'])
        self.assertTrue(len(data) > 0)
        self.assertIn(str(self.ticket_priority.id), [c['id'] for c in data])
        self.assertIn(str(self.ticket_priority.name), [c['name'] for c in data])


class ErrorPageTests(TestCase):

    def test_404(self):
        response = self.client.get(reverse('404'))
        self.assertEqual(response.status_code, 404)

    def test_500(self):
        response = self.client.get(reverse('500'))
        self.assertEqual(response.status_code, 500)


class SessionTests(TestCase):

    def setUp(self):
        self.person = create_single_person()
        self.login_data = {'username': self.person.username, 'password': PASSWORD}

    def test_session_expiry(self):
        with self.settings(SESSION_COOKIE_AGE=1):
            response = self.client.post(reverse('login'), self.login_data)
            self.assertIsNotNone(self.client.session.get('_auth_user_id', None))
            # simulate User inactivity, which leads to a "session timeout"
            time.sleep(1)
            response = self.client.get('/dashboard', follow=True)
            self.assertRedirects(response, '/login/?next=/dashboard')
            self.assertIsNone(self.client.session.get('_auth_user_id', None))
