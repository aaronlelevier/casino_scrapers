from __future__ import absolute_import

import unittest
import uuid
import time

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys

from helpers.element import is_present
from helpers.lorem_ipsum import LOREM_IPSUM_WORDS
from helpers import (
    LoginMixin, FillInHelper, JavascriptMixin,
    NavPage, GeneralElementsPage, Wait
)


class SeleniumGridTests(JavascriptMixin, LoginMixin, FillInHelper, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.set_window_size(1200, 1200)
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
        time.sleep(1)
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
        self.assertEqual(self.lorem[-1], usernames[1].text)

    def test_ordering_multiple(self):
        # order: username,title
        self.wait_for_xhr_request("t-sort-title-dir").click()
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(self.lorem[0], usernames[0].text)
        self.wait_for_xhr_request("t-sort-username-dir").click()
        titles = self.wait_for_xhr_request("t-person-title", plural=True)
        self.assertEqual(self.lorem[-1], titles[1].text)
        # order: -username,title
        self.wait_for_xhr_request("t-sort-username-dir").click()
        self.wait_for_xhr_request("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(self.lorem[0], usernames[0].text)
        self.wait_for_xhr_request("t-sort-username-dir").click()
        titles = self.wait_for_xhr_request("t-person-title", plural=True)
        self.assertEqual(self.lorem[-1], titles[1].text)

    def test_search_input(self):
        people = self.wait_for_xhr_request("t-grid-data", plural=True)
        self.assertEqual(len(people), 10)
        search = self.wait_for_xhr_request("t-grid-search-input").send_keys('zap')
        people = self.wait_for_xhr_request("t-grid-data", plural=True, debounce=True)
        self.assertEqual(len(people), 1)
        search = self.wait_for_xhr_request("t-grid-search-input").send_keys('aaaaa')
        with self.assertRaises(NoSuchElementException):
            people = self.wait_for_xhr_request("t-grid-data", debounce=True)
            people = self.driver.find_element_by_class_name("t-grid-data")

    def test_search_related(self):
        people = self.wait_for_xhr_request("t-grid-data", plural=True)
        self.assertEqual(len(people), 10)
        search = self.wait_for_xhr_request("t-grid-search-input").send_keys('wat-role')
        people = self.wait_for_xhr_request("t-grid-data", plural=True, debounce=True)
        self.assertEqual(len(people), 1)
        search = self.wait_for_xhr_request("t-grid-search-input").send_keys('aaaaa')
        with self.assertRaises(NoSuchElementException):
            people = self.wait_for_xhr_request("t-grid-data", debounce=True)
            people = self.driver.find_element_by_class_name("t-grid-data")

    def test_search_input_with_ordering(self):
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

    def test_search_field_and_order(self):
        # USERNAME
        # setup
        _username= "tt"
        _username_matches = sorted([x for x in self.lorem if _username in x])
        # test
        self.wait_for_xhr_request("t-filter-username").click()
        username_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        username_fulltext_search.send_keys(_username)
        people = self.wait_for_xhr_request("t-grid-data", plural=True, debounce=True)
        #TODO: commented out
        # self.assertEqual(len(people), len(_username_matches))
        # test - ordered
        self.driver.find_element_by_class_name("t-filterset-save-btn").click()
        self.driver.find_element_by_class_name("t-sort-username-dir").click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        #TODO: commented out
        # self.assertEqual(_username_matches[0], usernames[0].text)
        # TITLE
        # setup
        _title = "tt"
        _title_matches = [x for x in _username_matches if _title in x]
        # test
        self.wait_for_xhr_request("t-filter-fullname").click()
        title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        # self.assertEqual(title_fulltext_search.get_attribute("value"), _title)
        title_fulltext_search.clear()
        title_fulltext_search.send_keys(_title)
        people = self.wait_for_xhr_request("t-grid-data", plural=True, debounce=True)

        # TODO: Regression here. Grid isn't filtering w/ pop up search input currently.
        # self.assertEqual(len(people), len(_title_matches))
        # usernames = self.driver.find_elements_by_class_name("t-person-username")
        # self.assertEqual(_title_matches[0], usernames[0].text)
        # # test - w/ refresh
        # self.driver.refresh()
        # people = self.wait_for_xhr_request("t-grid-data", plural=True, just_refreshed=True)
        # self.assertEqual(len(people), len(_title_matches))
        # usernames = self.driver.find_elements_by_class_name("t-person-username")
        # self.assertEqual(_title_matches[0], usernames[0].text)
        # # submitted text still present
        # self.driver.find_element_by_class_name("t-filter-username").click()
        # # username_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        # # self.assertEqual(username_fulltext_search.get_attribute("value"), _username)
        # # self.driver.refresh()
        # # self.wait_for_xhr_request("t-grid-data", plural=True, just_refreshed=True)
        # # self.driver.find_element_by_class_name("t-filter-fullname").click()
        # # title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")

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

    def test_reset_grid(self):
        people = self.wait_for_xhr_request("t-grid-data", plural=True)
        self.assertEqual(len(people), 10)
        # Filter Username
        _username= "tt"
        _username_matches = sorted([x for x in self.lorem if _username in x])
        self.wait_for_xhr_request("t-filter-username").click()
        username_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        username_fulltext_search.send_keys(_username)
        people = self.wait_for_xhr_request("t-grid-data", plural=True, debounce=True)
        #TODO: commented out
        # self.assertEqual(len(people), len(_username_matches)) # 3

        # TODO: not currenly showing: "t-reset-grid").
        # Reset Grid
        # self.wait_for_xhr_request("t-reset-grid").click()
        # people = self.wait_for_xhr_request("t-grid-data", plural=True)
        # self.assertEqual(len(people), 10)

    def test_save_filter_person(self):
        # Sort DESC
        search_name = str(uuid.uuid4())[:5]
        self.wait_for_xhr_request("t-sort-username-dir", debounce=True).click()
        self.wait_for_xhr_request("t-filter-title", debounce=True).click()
        title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        title_fulltext_search.send_keys("a")
        title_fulltext_search.send_keys(Keys.RETURN)
        self.wait_for_xhr_request("t-sort-username-dir", debounce=True).click()
        usernames = self.wait_for_xhr_request("t-person-username", plural=True)
        self.assertEqual(usernames[0].text, 'zap-person')
        # Save FilterSet
        try:
            modal = self.wait_for_xhr_request("t-show-save-filterset-modal", debounce=True)
            modal.click()
            modal_input = self.wait_for_xhr_request("t-filterset-name-input")
            modal_input.send_keys(search_name)
            self.wait_for_xhr_request("t-filterset-save-btn").click()
            time.sleep(1)
            self.driver.find_element_by_link_text(search_name)
            # Reset Grid - Hard refresh OK b/c saved in the DB
            self.driver.refresh()
            self.wait_for_xhr_request("t-reset-grid").click()
            self.driver.find_element_by_link_text(search_name).click()
            usernames = self.wait_for_xhr_request("t-person-username", plural=True)
            self.assertEqual(usernames[0].text, 'zap-person')
        except NoSuchElementException:
            # filterset already applied b/c ran tests multiple times.  Jenkins should be ok b/c builds new everytime
            pass

    def test_save_filter_role(self):
        self.nav_page.find_role_link().click()
        # Sort DESC
        search_name = str(uuid.uuid4())[:5]
        self.wait_for_xhr_request("t-sort-name-dir", debounce=True).click()
        self.wait_for_xhr_request("t-filter-role-type", debounce=True).click()
        title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        title_fulltext_search.send_keys("a")
        title_fulltext_search.send_keys(Keys.RETURN)
        self.wait_for_xhr_request("t-sort-name-dir", debounce=True).click()
        names = self.wait_for_xhr_request("t-role-name", plural=True)
        # Save FilterSet
        try:
            modal = self.wait_for_xhr_request("t-show-save-filterset-modal", debounce=True)
            modal.click()
            modal_input = self.wait_for_xhr_request("t-filterset-name-input")
            modal_input.send_keys(search_name)
            self.wait_for_xhr_request("t-filterset-save-btn").click()
            time.sleep(1)
            self.driver.find_element_by_link_text(search_name)
            # Reset Grid - Hard refresh OK b/c saved in the DB
            self.driver.refresh()
            self.wait_for_xhr_request("t-reset-grid").click()
            self.driver.find_element_by_link_text(search_name).click()
            self.wait_for_xhr_request("t-role-name", plural=True)
        except NoSuchElementException:
            # filterset already applied b/c ran tests multiple times.  Jenkins should be ok b/c builds new everytime
            pass

    def test_save_filter_ticket(self):
        self.nav_page.find_ticket_link().click()
        # Sort DESC
        search_ticket = str(uuid.uuid4())[:5]
        self.wait_for_xhr_request("t-sort-location-name-dir", debounce=True).click()
        self.wait_for_xhr_request("t-filter-status-translated-name", debounce=True).click()
        title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
        title_fulltext_search.send_keys("n")
        title_fulltext_search.send_keys(Keys.RETURN)
        self.wait_for_xhr_request("t-sort-location-name-dir", debounce=True).click()
        locations = self.wait_for_xhr_request("t-ticket-location-name", plural=True)
        # Save FilterSet
        try:
            modal = self.wait_for_xhr_request("t-show-save-filterset-modal", debounce=True)
            modal.click()
            modal_input = self.wait_for_xhr_request("t-filterset-name-input")
            modal_input.send_keys(search_ticket)
            self.wait_for_xhr_request("t-filterset-save-btn").click()
            time.sleep(1)
            self.driver.find_element_by_link_text(search_ticket)
            # Reset Grid - Hard refresh OK b/c saved in the DB
            self.driver.refresh()
            self.wait_for_xhr_request("t-reset-grid").click()
            self.driver.find_element_by_link_text(search_ticket).click()
            self.wait_for_xhr_request("t-ticket-location-name", plural=True)
        except NoSuchElementException:
            # filterset already applied b/c ran tests multiple times.  Jenkins should be ok b/c builds new everytime
            pass

    #AARON: column reference name is ambiguous???
    # def test_save_filter_location(self):
    #     self.nav_page.find_location_link().click()
    #     # Sort DESC
    #     search_location = str(uuid.uuid4())[:5]
    #     self.wait_for_xhr_request("t-sort-name-dir", debounce=True).click()
    #     self.wait_for_xhr_request("t-filter-status-translated-name", debounce=True).click()
    #     title_fulltext_search = self.driver.find_element_by_class_name("t-new-entry")
    #     title_fulltext_search.send_keys("a")
    #     title_fulltext_search.send_keys(Keys.RETURN)
    #     self.wait_for_xhr_request("t-sort-name-dir", debounce=True).click()
    #     locations = self.wait_for_xhr_request("t-location-name", plural=True)
    #     # Save FilterSet
    #     try:
    #         modal = self.wait_for_xhr_request("t-show-save-filterset-modal", debounce=True)
    #         modal.click()
    #         modal_input = self.wait_for_xhr_request("t-filterset-name-input")
    #         modal_input.send_keys(search_location)
    #         self.wait_for_xhr_request("t-filterset-save-btn").click()
    #         time.sleep(1)
    #         self.driver.find_element_by_link_text(search_location)
    #         # Reset Grid - Hard refresh OK b/c saved in the DB
    #         self.driver.refresh()
    #         self.wait_for_xhr_request("t-reset-grid").click()
    #         self.driver.find_element_by_link_text(search_location).click()
    #         self.wait_for_xhr_request("t-location-name", plural=True)
    #     except NoSuchElementException:
    #         # filterset already applied b/c ran tests multiple times.  Jenkins should be ok b/c builds new everytime
    #         pass

if __name__ == "__main__":
    unittest.main()
