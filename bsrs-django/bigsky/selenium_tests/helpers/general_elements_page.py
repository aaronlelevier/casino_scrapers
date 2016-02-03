class GeneralElementsPage(object):
    '''
    Page objects for general DOM nodes
    '''
    def __init__(self, driver):
        self.driver = driver

    def find_add_btn(self):
        return self.driver.find_element_by_class_name("t-add-btn")

    def find_add_address_btn(self):
        return self.driver.find_element_by_class_name("t-add-address-btn")

    def find_add_email_btn(self):
        print("finding button")
        print(self.driver.find_element_by_class_name("t-add-email-btn"))
        print(self.driver.find_element_by_class_name("t-add-email-btn").text)
        return self.driver.find_element_by_class_name("t-add-email-btn")

    def click_save_btn(self):
        self.driver.find_element_by_class_name("t-save-btn").click()

    def click_delete_btn(self):
        self.driver.find_element_by_class_name("t-delete-btn").click()

    def click_dropdown_delete(self):
        self.driver.find_element_by_class_name("dropdown-toggle").click()
