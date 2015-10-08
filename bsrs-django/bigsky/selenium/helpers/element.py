from selenium.common.exceptions import NoSuchElementException

def is_present(driver, selector):
    element = False
    try:
        element = driver.find_element_by_class_name(selector)
    except NoSuchElementException as e:
        pass
    return element
