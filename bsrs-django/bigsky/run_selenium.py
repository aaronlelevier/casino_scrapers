import sys
import os
from os.path import join, abspath, dirname
import time
import signal
import subprocess
import multiprocessing
from django.core.management import execute_from_command_line


def django_app():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bigsky.settings.ci")
    execute_from_command_line(['manage.py'] + ['migrate'])
    execute_from_command_line(['manage.py'] + ['loaddata'] + ['fixtures/jenkins.json'])
    execute_from_command_line(['manage.py'] + ['runserver'] + ['--noreload'])

def run_selenium_tests():
    os.environ['browser'] = 'firefox'
    run_result = subprocess.call(['python', 'selenium/tests.py'])
    if run_result > 0:
        raise Exception("{} selenium test(s) failed".format(run_result))

if __name__ == '__main__':
    sys.path.append(abspath(join(dirname(__file__))))
    p = multiprocessing.Process(target=django_app)
    p.daemon = True
    p.start()
    time.sleep(20)
    run_selenium_tests()
    os.kill(int(p.pid), signal.SIGTERM)
