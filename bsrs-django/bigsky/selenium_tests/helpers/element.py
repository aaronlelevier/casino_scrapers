from __future__ import absolute_import

from selenium.common.exceptions import NoSuchElementException


def is_present(driver, selector):
    try:
        element = driver.find_element_by_class_name(selector)
    except NoSuchElementException:
        element = False

    return element
