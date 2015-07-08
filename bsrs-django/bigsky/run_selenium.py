import sys
import os
from os.path import join, abspath, dirname
import time
import signal
import subprocess
import multiprocessing
from django.core.management import execute_from_command_line

p = join(dirname(__file__))
sys.path.insert(1,p)
TEST_SCRIPT = abspath(join(dirname(__file__), 'selenium/tests.py'))

def django_app():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bigsky.settings.ci")
    execute_from_command_line(['manage.py'] + ['migrate'])
    execute_from_command_line(['manage.py'] + ['runserver'] + ['--noreload'])

def run_watir_tests_with_firefox():
    os.environ['browser'] = 'firefox'
    print TEST_SCRIPT
    run_result = subprocess.call(['python', TEST_SCRIPT])
    if run_result > 0:
        raise Exception("{} selenium test(s) failed".format(run_result))

if __name__ == '__main__':
    sys.path.append(abspath(join(dirname(__file__))))
    for p in sys.path:
        print p
    p = multiprocessing.Process(target=django_app)
    p.daemon = True
    p.start()
    time.sleep(2)
    run_watir_tests_with_firefox()
    os.kill(int(p.pid), signal.SIGTERM)
