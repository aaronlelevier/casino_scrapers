import random
import string


def rand_chars(number=10):
    return 'aa'+''.join([str(random.choice(string.ascii_letters)) for x in range(number)])

def rand_num():
    return ''.join([str(random.randrange(0, 10)) for x in range(10)])
