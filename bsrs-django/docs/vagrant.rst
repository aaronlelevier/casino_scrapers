Vagrant
-------

Startup

.. code-block::

	cd /to/vagrant/dir/
	vagrant up
	vagrant ssh

	# web user runs the app
	sudo su web

	# vagrant password = vagrant

	# got to web user home, and activate bash
	bash
	cd

	# get fresh copy of the repo
	rm -rf bsrs
	git clone git@github.com:bigskytech/bsrs.git