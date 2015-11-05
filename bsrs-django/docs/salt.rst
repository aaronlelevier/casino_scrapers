SaltSatck Config Notes
----------------------

`OPENING THE FIREWALL UP FOR SALT <https://docs.saltstack.com/en/latest/topics/tutorials/firewall.html>`_

yum packages
------------

.. code-block::

    # for fileserver_backend

    yum install python-pygit2


Salt Master Config
------------------

Install at least 1 filserver back end, and remote

.. code-block:: yaml

    # /etc/salt/master

    fileserver_backend:
        - roots
        - git

    gitfs_remotes:
        - git://github.com/saltstack-formulas/postgres-formula.git


Common Commands
---------------

.. code-block::

    # running processes

    ps aux | grep 'salt'

    # start / stop on Centos

    sudo service salt-minion start

    # install a package

    sudo salt '*' pkg.install vim

    # install a state

    sudo salt '*' state.sls <package>
