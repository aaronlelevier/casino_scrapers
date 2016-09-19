from __future__ import absolute_import

import os
import unittest
import time

from selenium import webdriver

from helpers import (
    LoginMixin, FillInHelper, JavascriptMixin, InputHelper,
    NavPage, GeneralElementsPage, Wait, ModelPage, rand_chars
)


class TicketTests(JavascriptMixin, LoginMixin, FillInHelper, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.set_window_size(1300, 1200)
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)
        # Generic Elements
        self.gen_elem_page = GeneralElementsPage(self.driver)
        self.nav_page = NavPage(self.driver)
        time.sleep(3)
        # Go to Ticket Area
        self.nav_page.find_ticket_link().click()

    def tearDown(self):
        self.driver.close()

    def test_file_upload(self):
        # Create Ticket Page Object
        ticket_page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-ticket-request",
            list_data = "t-grid-data"
        )
        self.wait_for_xhr_request("t-sort-request-dir").click()
        tickets = ticket_page.find_list_data()
        tickets[0].click()
        # Detail View
        attach_file_btn = self.wait_for_xhr_request_xpath("//input[@type='file']")
        attach_file_btn.send_keys(os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "media/test_in/es.csv"
        ))
        self.gen_elem_page.click_save_btn()
        # List View
        tickets = ticket_page.find_list_data()

    def test_image_upload(self):
        # Create Ticket Page Object
        ticket_page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-ticket-request",
            list_data = "t-grid-data"
        )
        self.wait_for_xhr_request("t-sort-request-dir").click()
        tickets = ticket_page.find_list_data()
        tickets[0].click()
        # Detail View
        attach_file_btn = self.wait_for_xhr_request_xpath("//input[@type='file']")
        attach_file_btn.send_keys(os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "media/test_in/aaron.jpeg"
        ))
        self.gen_elem_page.click_save_btn()
        # List View
        tickets = ticket_page.find_list_data()

    def test_file_delete(self):
        """
        Upload 2 Attachments for a Ticket, but then navigate away, and the
        Attachments should be deleted.
        """
        # Create Ticket Page Object
        ticket_page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-ticket-request",
            list_data = "t-grid-data"
        )
        self.wait_for_xhr_request("t-sort-request-dir").click()
        tickets = ticket_page.find_list_data()
        tickets[0].click()
        # Detail View
        # File 1
        attach_file_btn = self.wait_for_xhr_request_xpath("//input[@type='file']")
        attach_file_btn.send_keys(os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "media/test_in/es.csv"
        ))
        # File 2
        attach_file_btn = self.driver.find_element_by_xpath("//input[@type='file']")
        attach_file_btn.send_keys(os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "media/test_in/jp.csv"
        ))
        # Go to Ticket Area
        self.driver.execute_script("window.scrollTo(0, 0);")
        self.nav_page.find_ticket_link().click()
        tab = self.wait_for_xhr_request("t-tab-close")
        # tab.click()
        # self.wait_for_xhr_request("application-modal", debounce=True).click()
        # # self.driver_wait.find_element_by_class_name("application-modal")
        # WebDriverWait(self.driver, 10).until(
        #     EC.presence_of_element_located((By.CLASS_NAME, "modal-title"))
        # )
        # rollback_btn = self.wait_for_xhr_request("t-modal-rollback-btn", debounce=True)
        # rollback_btn.click()
        # # revisit page
        # tickets = ticket_page.find_list_data()
        # tickets[0].click()
        # # no more attachments on page
        # self.driver.refresh()
        # with self.assertRaises(InvalidSelectorException):
        #     self.driver.find_elements_by_class_name("progress active")

    def test_ticket(self):
        ### CREATE
        # Create Ticket Page Object
        ticket_page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-ticket-request",
            list_data = "t-grid-data"
        )
        ticket_page.find_list_data()
        # Get to "ticket create view"
        ticket_new_link = ticket_page.find_new_link()
        ticket_new_link.click()
        # Enter info and hit "save"
        ticket_request = rand_chars()
        ticket_requester = rand_chars()
        ticket = InputHelper(ticket_request=ticket_request, ticket_requester=ticket_requester)
        self._fill_in_using_class(ticket)
        ticket_priority_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-priority-select ')]/div")
        ticket_priority_input.click()
        priority_option = self.driver.find_element_by_xpath("//*[@aria-current='true']")
        priority_option.click()
        ticket_status_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-status-select ')]/div")
        ticket_status_input.click()
        status_option = self.driver.find_element_by_xpath("//*[@aria-current='true']")
        status_option.click()
        ticket_location = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-location-select ')]/div")
        ticket_location.click()
        ticket_location_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-search ')]/input")
        ticket_location_input.send_keys("Company")
        self.wait_for_xhr_request_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-options ')]/li[1]", debounce=True)
        location_option = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-options ')]/li[1]")
        location_option.click()
        ticket_assignee = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-assignee-select ')]/div")
        ticket_assignee.click()
        ticket_assignee_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-search ')]/input")
        ticket_assignee_input.send_keys("a")
        self.wait_for_xhr_request_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-options ')]/li[1]", debounce=True)
        assignee_option = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-options ')]/li[1]")
        assignee_option.click()
        ticket_category = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-model-category-select ')]/div")
        ticket_category.click()
        # Select 3 Categories for this Ticket
        # one
        category_option = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
        category_option.click()
        # two
        ticket_category = self.wait_for_xhr_request_xpath("(//*[contains(@class, 't-model-category-select')])[last()]")
        ticket_category.click()
        category_option = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
        category_option.click()
        # three
        ticket_category = self.wait_for_xhr_request_xpath("(//*[contains(@class, 't-model-category-select')])[last()]")
        ticket_category.click()
        category_option = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
        category_option.click()
        # four
        ticket_category = self.wait_for_xhr_request_xpath("(//*[contains(@class, 't-model-category-select')])[last()]")
        ticket_category.click()
        category_option = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
        category_option.click()

        self.gen_elem_page.click_save_btn()
        # Go to newly created ticket's Detail view
        ticket_page.find_list_data()
        self.wait_for_xhr_request("t-sort-request-dir").click()
        self.driver.refresh()
        ticket_list_view = ticket_page.find_list_name()
        new_ticket = ticket_page.click_name_in_list_pages(ticket_request, new_model=None)
        try:
            new_ticket.click()
        except AttributeError as e:
            raise e("new ticket not found")
        ### UPDATE
        # # Go to ticket Detail view, Change request and hit "save"
        # ticket_page.find_wait_and_assert_elem("t-ticket-request", ticket_request)
        # ticket_request_two = rand_chars()
        # self.driver.find_element_by_class_name("t-ticket-request").clear()
        # ticket = InputHelper(ticket_request=ticket_request_two)
        # self._fill_in_using_class(ticket)
        # ticket_priority_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-priority-select ')]/div")
        # ticket_priority_input.click()
        # priority_option = self.driver.find_element_by_xpath("//*[contains(@class, 'ember-power-select-options')]/li[2]")
        # priority_option.click()
        # ticket_status_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-status-select ')]/div")
        # ticket_status_input.click()
        # status_option = self.driver.find_element_by_xpath("//*[contains(@class, 'ember-power-select-options')]/li[2]")
        # status_option.click()
        # ticket_cc_input = self.driver.find_element_by_xpath("//*[contains(@class, 'ember-power-select-trigger-multiple-input')]")
        # ticket_cc_input.click()
        # ticket_cc_input.send_keys("a")
        # cc_option = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]", debounce=True)
        # cc_option.click()
        # ticket_cc_input.click()
        # ticket_cc_input.send_keys("l")
        # cc_option_2 = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]", debounce=True)
        # cc_option_2.click()
        # ticket_location = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-location-select ')]/div")
        # ticket_location.click()
        # ticket_location_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-search ')]/input")
        # ticket_location_input.send_keys("Company")
        # self.wait_for_xhr_request_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-options ')]/li[1]", debounce=True)
        # location_option = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-options ')]/li[1]")
        # location_option.click()
        # self.gen_elem_page.click_save_btn()
        # # # List view contains new request
        # ticket_page.find_list_data()
        # self.driver.refresh()
        # ticket_list_view_two = ticket_page.find_list_name()
        # new_ticket_two = ticket_page.click_name_in_list_pages(ticket_request_two, new_model=None)
        # try:
        #     new_ticket_two.click()
        # except AttributeError as e:
        #     raise e("new ticket not found")
        # ### DELETE
        # # Go to Ticket Detail view click Delete
        # ticket_page.find_wait_and_assert_elem("t-ticket-request", ticket_request_two)
        # self.gen_elem_page.click_dropdown_delete()
        # self.gen_elem_page.click_delete_btn()
        # time.sleep(1)
        # self.gen_elem_page.click_delete_yes()
        # # check Ticket is deleted
        # tickets = ticket_page.find_list_data()
        # ticket_list_view = ticket_page.find_list_name()
        # # this needs to be improved to look through all the pages
        # self.assertNotIn(
        #     ticket_request_two,
        #     [r.text for r in ticket_list_view]
        # )

    def test_ticket__for_automation_processing(self):
        ### CREATE
        # Create Ticket Page Object
        ticket_page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-ticket-request",
            list_data = "t-grid-data"
        )
        ticket_page.find_list_data()
        # Get to "ticket create view"
        ticket_new_link = ticket_page.find_new_link()
        ticket_new_link.click()
        # Enter info and hit "save"
        ticket_request = rand_chars()
        ticket_requester = rand_chars()
        ticket = InputHelper(ticket_request=ticket_request, ticket_requester=ticket_requester)
        self._fill_in_using_class(ticket)
        ticket_priority_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-priority-select ')]/div")
        ticket_priority_input.click()
        priority_option = self.driver.find_element_by_xpath("//*[@aria-current='true']")
        priority_option.click()
        ticket_status_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-status-select ')]/div")
        ticket_status_input.click()
        # New is the first option, pick that because status must equal "new" in order to 
        # process ticket
        status_option = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-options ')]/li[1]")
        status_option.click()
        ticket_location = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-location-select ')]/div")
        ticket_location.click()
        ticket_location_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-search ')]/input")
        ticket_location_input.send_keys("Company")
        self.wait_for_xhr_request_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-options ')]/li[1]", debounce=True)
        location_option = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' ember-power-select-options ')]/li[1]")
        location_option.click()
        # NOT ASSIGNEE IS SELECTED! This what we want b/c we want it to get assigned by the
        # backend `process ticket` function
        ticket_category = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-model-category-select ')]/div")
        ticket_category.click()
        # Select 3 Categories for this Ticket
        # one
        category_option = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
        category_option.click()
        # two
        ticket_category = self.wait_for_xhr_request_xpath("(//*[contains(@class, 't-model-category-select')])[last()]")
        ticket_category.click()
        category_option = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
        category_option.click()
        # three
        ticket_category = self.wait_for_xhr_request_xpath("(//*[contains(@class, 't-model-category-select')])[last()]")
        ticket_category.click()
        category_option = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
        category_option.click()
        # four
        ticket_category = self.wait_for_xhr_request_xpath("(//*[contains(@class, 't-model-category-select')])[last()]")
        ticket_category.click()
        category_option = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
        category_option.click()
        # assignee was not filled out
        assignee_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-assignee-select ')]/div")
        # save
        # TODO: AARON - to fix later
        # self.gen_elem_page.click_save_btn()
        # # Go to newly created ticket's Detail view
        # ticket_page.find_list_data()
        # self.wait_for_xhr_request("t-sort-request-dir").click()
        # self.driver.refresh()
        # ticket_list_view = ticket_page.find_list_name()
        # new_ticket = ticket_page.click_name_in_list_pages(ticket_request, new_model=None)
        # try:
        #     new_ticket.click()
        # except AttributeError as e:
        #     raise e("new ticket not found")
        # # find "assignee" in DOM, and it has been populated
        # assignee_input = self.wait_for_xhr_request_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-assignee-select ')]/div")
        # assert assignee_input.text != 'power.select.select'
        # assert assignee_input.text


if __name__ == "__main__":
    unittest.main()
