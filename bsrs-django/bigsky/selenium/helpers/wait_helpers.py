from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def wait_elemment(arg1):
    '''Decorator to define the element type that the Webdriver 
    should wait for.'''
    def _outer_wrapper(wrapped_function):
        def _wrapper(*args, **kwargs):
            # do something before the function call
            self = args[0]
            element = WebDriverWait(self.driver, self.wait_time).until(
                EC.presence_of_element_located((arg1, args[1]))
            )
            args = (args[0], element)
            # function call
            result = wrapped_function(*args, **kwargs)
            # do something after the function call
            return result
        return _wrapper
    return _outer_wrapper


def wait_elemments(arg1):
    '''Decorator to define the elements that the Webdriver 
    should wait for.'''
    def _outer_wrapper(wrapped_function):
        def _wrapper(*args, **kwargs):
            # do something before the function call
            self = args[0]
            element = WebDriverWait(self.driver, self.wait_time).until(
                EC.presence_of_all_elements_located((arg1, args[1]))
            )
            args = (args[0], element)
            # function call
            result = wrapped_function(*args, **kwargs)
            # do something after the function call
            return result
        return _wrapper
    return _outer_wrapper


class Wait(object):
    '''
    Waits for elements to be present before returning them.

    :driver: selenium driver
    :wait_time: *optional* kwarg for for wait time in seconds

    Each decorated method is shorthand for this code:

    ..code-block::

        driver = webdriver.Firefox()
        driver.get("http://somedomain/url_that_delays_loading")
        try:
            element = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "myDynamicElement"))
            )
        finally:
            driver.quit()

    '''
    def __init__(self, driver, wait_time=10):
        self.driver = driver
        self.wait_time = wait_time

    # SINGULAR

    @wait_elemment(By.ID)
    def find_element_by_id(self, element):
        return element

    @wait_elemment(By.CLASS_NAME)
    def find_element_by_class_name(self, element):
        return element

    ### PLURAL

    @wait_elemments(By.CLASS_NAME)
    def find_elements_by_class_name(self, element):
        return element
