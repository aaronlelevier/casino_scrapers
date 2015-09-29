import unittest

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys

from helpers.element import is_present
from helpers.lorem_ipsum import LOREM_IPSUM_WORDS
from helpers import (
    LoginMixin, FillInHelper, JavascriptMixin,
    NavPage, GeneralElementsPage, Wait,
)

class SeleniumGridTests(JavascriptMixin, LoginMixin, FillInHelper, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)
        # Lorem
        self.lorem = sorted(LOREM_IPSUM_WORDS.split())
        # Generic Elements
        self.gen_elem_page = GeneralElementsPage(self.driver)
        # Go to Admin Page
        self.nav_page = NavPage(self.driver)
        self.nav_page.click_admin()
        # Go to Person Area
        self.nav_page.find_people_link().click()

    def tearDown(self):
        self.driver.close()

    def test_ordering(self):
        # ASC
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(self.lorem[0], usernames[0].text)
        # DESC
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(self.lorem[-1], usernames[0].text)

    def test_ordering_multiple(self):
        # order: username,title
        self.wait_for_xhr_request("t-sort-title-dir").click()
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(self.lorem[0], usernames[0].text)
        self.wait_for_xhr_request("t-sort-username-dir").click()
        titles = self.wait_for_xhr_request("t-person-title", plural=True)
        self.assertEqual(self.lorem[-1], titles[0].text)
        # order: -username,title
        self.wait_for_xhr_request("t-sort-username-dir").click()
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(self.lorem[-1], usernames[0].text)
        self.wait_for_xhr_request("t-sort-username-dir").click()
        titles = self.wait_for_xhr_request("t-person-title", plural=True)
        self.assertEqual(self.lorem[0], titles[0].text)

    def test_search(self):
        people = self.wait_for_xhr_request("t-grid-data", plural=True)
        self.assertEqual(len(people), 10)
        search = self.wait_for_xhr_request("t-grid-search-input").send_keys('cu')
        people = self.wait_for_xhr_request("t-grid-data", plural=True)
        self.assertEqual(len(people), 10)
        search = self.wait_for_xhr_request("t-grid-search-input").send_keys('aaaaa')
        with self.assertRaises(NoSuchElementException):
            people = self.wait_for_xhr_request("t-grid-data", debounce=True)
            people = self.driver.find_element_by_class_name("t-grid-data")

    def test_search_ordering(self):
        # Search
        _search_input = "ab"
        _search_input_matches = sorted([x for x in self.lorem if _search_input in x])
        search = self.wait_for_xhr_request("t-grid-search-input").send_keys(_search_input)
        people = self.wait_for_xhr_request("t-grid-data", plural=True, debounce=True)
        self.assertEqual(len(people), len(_search_input_matches))
        # Order
        self.wait_for_xhr_request("t-sort-title-dir").click()
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(_search_input_matches[0], usernames[0].text)
        # Order: -username,title
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(_search_input_matches[-1], usernames[0].text)
        # Search maintained
        people = self.wait_for_xhr_request("t-grid-data", plural=True)
        self.assertEqual(len(people), len(_search_input_matches))

    def test_full_text_search(self):
        # USERNAME
        # setup
        _username= "tt"
        _username_matches = sorted([x for x in self.lorem if _username in x])
        # test
        self.wait_for_xhr_request("t-filter-username").click()
        username_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        username_fulltext_search.send_keys(_username)
        people = self.wait_for_xhr_request("t-grid-data", plural=True, debounce=True)
        self.assertEqual(len(people), len(_username_matches))
        # test - ordered
        self.driver.find_element_by_class_name("t-sort-username-dir").click()
        usernames = self.driver.find_elements_by_class_name("t-person-username")
        self.assertEqual(_username_matches[0], usernames[0].text)
        # TITLE
        # setup
        _title = "p"
        _title_matches = [x for x in _username_matches if _title in x]
        # test
        self.driver.find_element_by_class_name("t-filter-title").click()
        title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        title_fulltext_search.send_keys(_title)
        people = self.wait_for_xhr_request("t-grid-data", plural=True, debounce=True)
        self.assertEqual(len(people), len(_title_matches))
        usernames = self.driver.find_elements_by_class_name("t-person-username")
        self.assertEqual(_title_matches[0], usernames[0].text)
        # test - w/ refresh
        self.driver.refresh()
        people = self.wait_for_xhr_request("t-grid-data", plural=True, just_refreshed=True)
        self.assertEqual(len(people), len(_title_matches))
        usernames = self.driver.find_elements_by_class_name("t-person-username")
        self.assertEqual(_title_matches[0], usernames[0].text)
        # submitted text still present
        self.driver.find_element_by_class_name("t-filter-username").click()
        username_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        self.assertEqual(username_fulltext_search.get_attribute("value"), _username)
        self.driver.find_element_by_class_name("t-filter-title").click()
        title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        self.assertEqual(title_fulltext_search.get_attribute("value"), _title)

    def test_full_text_search_hidden_on_enter_and_escape(self):
        self.wait_for_xhr_request("t-filter-username").click()
        username_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        username_fulltext_search.send_keys("at")
        username_fulltext_search.send_keys(Keys.RETURN)
        fulltext_modal_present = is_present(self.driver, "ember-modal-dialog")
        self.assertEqual(fulltext_modal_present, False)
        self.wait_for_xhr_request("t-filter-title").click()
        title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        title_fulltext_search.send_keys("de")
        title_fulltext_search.send_keys(Keys.ESCAPE)
        title_modal_present = is_present(self.driver, "ember-modal-dialog")
        self.assertEqual(title_modal_present, False)

if __name__ == "__main__":
    unittest.main()
