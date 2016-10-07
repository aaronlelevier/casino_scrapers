import sys
import os
import platform
from os.path import join, abspath, dirname
import time
import signal
import subprocess
import multiprocessing
from django.core.management import execute_from_command_line


def django_app():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bigsky.settings.ci")
    execute_from_command_line(['manage.py'] + ['migrate'])
    execute_from_command_line(['manage.py'] + ['selenium'])
    execute_from_command_line(['manage.py'] + ['runserver'] + ['0.0.0.0:8001'] + ['--noreload'])


def run_selenium_tests():
    os.environ['browser'] = 'firefox'

    run_selenium_test(['python', 'selenium_tests/admin_crud.py'])
    run_selenium_test(['python', 'selenium_tests/grid.py'])
    run_selenium_test(['python', 'selenium_tests/ticket.py'])
    run_selenium_test(['python', 'selenium_tests/mobile.py'])

    # run_selenium_test(['python', 'selenium_tests/ticket_ipad.py'])


def run_selenium_test(args):
    result = subprocess.call(args)
    if result > 0:
        raise Exception("{} selenium test(s) failed".format(result))


def sleep_based_on_platform():
    if platform.system() == "Darwin":
        time.sleep(5)
    else:
        time.sleep(20)


if __name__ == '__main__':
    sys.path.append(abspath(join(dirname(__file__))))
    p = multiprocessing.Process(target=django_app)
    p.daemon = True
    p.start()
    sleep_based_on_platform()
    run_selenium_tests()
    os.kill(int(p.pid), signal.SIGTERM)
