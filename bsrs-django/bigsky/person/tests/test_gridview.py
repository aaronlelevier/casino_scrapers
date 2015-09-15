import os
import uuid
import time
import random
import string

from django.test import LiveServerTestCase

from selenium import webdriver
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys

from rest_framework.test import APILiveServerTestCase

# from selenium_tests.helpers import (
#     LoginMixin, FillInHelper, JavascriptMixin, InputHelper,
#     NavPage, GeneralElementsPage, Wait, PersonPage, ModelPage
# )
from person.tests.factory import (create_role, create_single_person,
    PASSWORD)


os.environ.setdefault("DJANGO_LIVE_TEST_SERVER_ADDRESS",
                      "localhost:8000-8010,8080,9200-9300")


class GridViewTests(LiveServerTestCase):

    @classmethod
    def setUpClass(cls):
        super(GridViewTests, cls).setUpClass()
        cls.driver = webdriver.Firefox()

        cls.wait = webdriver.support.ui.WebDriverWait(cls.driver, 5)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()
        super(GridViewTests, cls).tearDownClass()

    # def test_login(self):
    #     self.driver.get('%s%s' % (self.live_server_url, '/login/'))
    #     time.sleep(3)

    def test_gridview_get(self):
        # users
        self.role = create_role()
        self.person = create_single_person(username='aaron', role=self.role)

        self.driver.get("{}/dashboard".format(self.live_server_url))

        username_input = self.driver.find_element_by_id("id_username")
        password_input = self.driver.find_element_by_id("id_password")

        assert username_input.is_displayed()
        assert password_input.is_displayed()

        username_input.send_keys(self.person.username)
        password_input.send_keys(PASSWORD)
        password_input.send_keys(Keys.RETURN)

        # self.wait.until(lambda browser: browser.title.lower().startswith('bsrs-ember'))

        # self.driver.get('%s%s' % (self.live_server_url, '/admin/people/index'))
        time.sleep(50)


    # def setUp(self):
    #     # users
    #     self.role = create_role()
    #     self.person = create_single_person(username='aaron', role=self.role)

    #     self.driver = webdriver.Firefox()
    #     self.wait = webdriver.support.ui.WebDriverWait(self.driver, 5)
    #     # Login

    #     self.client.force_authenticate(user=self.person)

    #     # Wait
    #     self.driver_wait = Wait(self.driver)
    #     # Go-to Grid View
    #     self.driver.get('%s%s' % (self.live_server_url, '/admin/people/index'))


    # def tearDown(self):
    #     self.driver.close()

    # def tearDown(self):
    #     self.driver.close()

    # def test_ordering(self):
    #     # ASC
    #     self.driver.find_element_by_class_name("t-sort-username").click()
    #     usernames = self.wait_for_xhr_request("t-person-username", plural=True)
    #     self.assertEqual("aaron", usernames[0].text)
    #     # DESC
    #     self.driver.find_element_by_class_name("t-sort-username").click()
    #     usernames = self.wait_for_xhr_request("t-person-username", plural=True)
    #     self.assertEqual("voluptate", usernames[0].text)

    # def test_ordering_multiple(self):
    #     # order: first_name, username
    #     self.driver.find_element_by_class_name("t-sort-first-name").click()
    #     self.driver.find_element_by_class_name("t-sort-username").click()
    #     usernames = self.wait_for_xhr_request("t-person-username", plural=True)
    #     self.assertEqual("dolore", usernames[0].text)
    #     fullnames = self.wait_for_xhr_request("t-person-fullname", plural=True)
    #     self.assertEqual("A N", fullnames[0].text)
    #     self.assertEqual("A N", fullnames[1].text)
    #     # order: first_name, -username
    #     self.driver.find_element_by_class_name("t-sort-username").click()
    #     usernames = self.wait_for_xhr_request("t-person-username", plural=True)
    #     self.assertEqual("minim", usernames[0].text)
    #     fullnames = self.wait_for_xhr_request("t-person-fullname", plural=True)
    #     self.assertEqual("A N", fullnames[0].text)
    #     self.assertEqual("A N", fullnames[1].text)

    # def test_search(self):
    #     people = self.wait_for_xhr_request("t-person-data", plural=True)
    #     self.assertEqual(len(people), 10)
    #     search = self.wait_for_xhr_request("t-grid-search-input").send_keys('a')
    #     people = self.wait_for_xhr_request("t-person-data", plural=True)
    #     self.assertEqual(len(people), 3)
    #     search = self.wait_for_xhr_request("t-grid-search-input").send_keys('aaaaa')
    #     with self.assertRaises(NoSuchElementException):
    #         people = self.driver.find_element_by_class_name("t-person-data")

    # def test_search_ordering(self):
    #     # Search
    #     search = self.wait_for_xhr_request("t-grid-search-input").send_keys('a')
    #     people = self.wait_for_xhr_request("t-person-data", plural=True)
    #     self.assertEqual(len(people), 3)
    #     # Order
    #     self.driver.find_element_by_class_name("t-sort-first-name").click()
    #     self.driver.find_element_by_class_name("t-sort-username").click()
    #     # order: first_name, -username
    #     self.driver.find_element_by_class_name("t-sort-username").click()
    #     usernames = self.wait_for_xhr_request("t-person-username", plural=True)
    #     self.assertEqual("minim", usernames[0].text)
    #     # Search maintained
    #     people = self.wait_for_xhr_request("t-person-data", plural=True)
    #     self.assertEqual(len(people), 4)