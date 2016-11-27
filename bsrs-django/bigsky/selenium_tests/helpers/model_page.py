from .javascript import JavascriptMixin


class ModelPage(JavascriptMixin):
    """Inherit from ``JavascriptMixin`` so has access
    to the ``$.active xhr wait method``."""

    def __init__(self, driver, new_link, list_name, list_data, *args, **kwargs):
        # Selenium
        self.driver = driver
        # Page
        self.new_link = new_link
        self.list_name = list_name
        self.list_data = list_data

    def find_new_link(self):
        return self.wait_for_xhr_request(self.new_link)

    def find_wait_and_assert_elem(self, elem, value):
        elem_input = self.wait_for_xhr_request(elem)
        assert value in elem_input.get_attribute("value")

    def find_and_assert_elems(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k + "_input", self.driver.find_element_by_id(k))
            assert getattr(self, k + "_input").get_attribute("value") == v

    def find_list_name(self):
        return self.wait_for_xhr_request(self.list_name, plural=True, debounce=True)

    def find_list_data(self, just_refreshed=False):
        return self.wait_for_xhr_request(self.list_data, plural=True, debounce=True)

    def find_power_select_data(self, xpath, just_refreshed=False):
        return self.wait_for_xhr_request(xpath, plural=True, just_refreshed=just_refreshed)

    def _loop_over_names(self, name, new_model, count):
        """Loop over names in the list.
        :Return: new_model; incremented count for the page.
        """
        try:
            self.find_list_data()
        except AssertionError:
            pass
        list_view_elements = self.find_list_name()
        for row in list_view_elements:
            if row.text and name in row.text:
                new_model = row
        count += 1
        return (new_model, count)

    """ new_model - TODO: remove new_model from args """
    def click_name_in_list_pages(self, name, new_model=None):
        pagination = self.wait_for_xhr_request("t-pages", debounce=True)
        element_list = pagination.find_elements_by_class_name("t-page")
        element_list_len = len(element_list)
        count = 0
        while count < element_list_len:
            new_model, count = self._loop_over_names(name, new_model, count)
            if new_model:
                break
            pagination = self.wait_for_xhr_request("t-pages", debounce=True)
            element_list = pagination.find_elements_by_class_name("t-page")
            next_elem = element_list[count]
            next_elem.find_element_by_xpath("a").click()
        return new_model

    @staticmethod
    def click_name_in_list(name, list_view_elements):
        new_location = None
        for row in list_view_elements:
            if row.text and row.text == name:
                new_location = row
        if new_location:
            try:
                new_location.click()
            except AttributeError as e:
                raise e("new location level not found")
