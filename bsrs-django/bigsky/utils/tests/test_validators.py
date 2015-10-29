from django.test import TestCase

from utils.validators import (regex_check_contains, contains_digit, contains_upper_char,
    contains_lower_char, contains_special_char, contains_no_whitespaces)


DIGITS = "Bobby123"
NO_DIGITS = "django"

UPPER_CHARS = "Jimmy"
NO_UPPER_CHARS = "johnson"

LOWER_CHARS = "Jimmy"
NO_LOWER_CHARS = "JOHNSON"

SPECIAL_CHARS = "specialchar:$"
NO_SPECIAL_CHARS = "nospecialchars"

WHITESPACE = "joe tassone"
NO_WHITESPACE = "joe"


class ValidatorTests(TestCase):

    def test_regex_check_contains_true(self):
        regex = r'\d+'
        chars = "Number1Racer"
        ret = regex_check_contains(regex, chars)
        self.assertTrue(ret)

    def test_regex_check_contains_false(self):
        regex = r'\d+'
        chars = "django"
        ret = regex_check_contains(regex, chars)
        self.assertFalse(ret)

    def test_contains_digit_true(self):
        self.assertTrue(contains_digit(DIGITS))

    def test_contains_digit_false(self):
        self.assertFalse(contains_digit(NO_DIGITS))

    def test_contains_upper_char_true(self):
        self.assertTrue(contains_upper_char(UPPER_CHARS))

    def test_contains_upper_char_false(self):
        self.assertFalse(contains_upper_char(NO_UPPER_CHARS))

    def test_contains_lower_char_true(self):
        self.assertTrue(contains_lower_char(LOWER_CHARS))

    def test_contains_lower_char_false(self):
        self.assertFalse(contains_lower_char(NO_LOWER_CHARS))

    def test_contains_special_char_true(self):
        self.assertTrue(contains_special_char(SPECIAL_CHARS))

    def test_contains_special_char_false(self):
        self.assertFalse(contains_special_char(NO_SPECIAL_CHARS))

    def test_contains_no_whitespaces_true(self):
        self.assertTrue(contains_no_whitespaces(NO_WHITESPACE))

    def test_contains_no_whitespaces_false(self):
        self.assertFalse(contains_no_whitespaces(WHITESPACE))
