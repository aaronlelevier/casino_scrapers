from __future__ import absolute_import

import unittest
import random
import string

from selenium import webdriver

from helpers import (
    LoginMixin, FillInHelper, JavascriptMixin,
    NavPage, GeneralElementsPage, Wait, ModelPage
)

def rand_chars(number=10):
    return ''.join([str(random.choice(string.ascii_letters)) for x in range(number)])


class TicketTests(JavascriptMixin, LoginMixin, FillInHelper, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)
        # Generic Elements
        self.gen_elem_page = GeneralElementsPage(self.driver)
        self.nav_page = NavPage(self.driver)

    def tearDown(self):
        self.driver.close()

    def test_ticket(self):
        ### CREATE
        # Go to Ticket Area
        self.nav_page.find_ticket_link().click()
        # Create Ticket Page Object
        ticket_page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-ticket-subject",
            list_data = "t-grid-data"
        )
        ticket_page.find_list_data()
        # Get to "ticket create view"
        ticket_new_link = ticket_page.find_new_link()
        ticket_new_link.click()
        # Enter info and hit "save"
    ## NEED LOCATION SELECT BOX FOR SAVE TO WORK
        # ticket_subject = rand_chars()
        # ticket = InputHelper(ticket_subject=ticket_subject)
        # self._fill_in_using_class(ticket)
        # ticket_status_input = Select(self.driver.find_element_by_class_name("t-ticket-status"))
        # ticket_status_input.select_by_index(1)
        # ticket_priority_input = Select(self.driver.find_element_by_class_name("t-ticket-priority"))
        # ticket_priority_input.select_by_index(1)
        # self.gen_elem_page.click_save_btn()
        # # Go to newly created ticket's Detail view
        # self.driver_wait.find_elements_by_class_name(ticket_page.list_data)
        # self.driver.refresh()
        # ticket_list_view = ticket_page.find_list_name()
        # ticket_page.click_name_in_list(ticket_subject, ticket_list_view)
        ### UPDATE
        # Go to ticket Detail view, Change subject and hit "save"
        # ticket_page.find_wait_and_assert_elem("t-ticket-subject", ticket_subject)
        # ticket_subject = rand_chars()
        # ticket = InputHelper(ticket_subject=ticket_subject)
        # self._fill_in_using_class(ticket)
        # self.gen_elem_page.click_save_btn()
        # # List view contains new subject
        # tickets = ticket_page.find_list_data()
        # ticket_list_view = ticket_page.find_list_name()
        # ticket_page.click_name_in_list(ticket_subject, ticket_list_view)
#         # ### DELETE
#         # # Go to ticket Detail view click Delete
#         # self.gen_elem_page.click_dropdown_delete()
#         # self.gen_elem_page.click_delete_btn()
#         # # check Role is deleted
#         # self.driver.refresh()
#         tickets = ticket_page.find_list_data()
#         ticket_list_view = ticket_page.find_list_name()
#         self.assertNotIn(
#             ticket_number,
#             [r.text for r in ticket_list_view]
#         )


if __name__ == "__main__":
    unittest.main()
