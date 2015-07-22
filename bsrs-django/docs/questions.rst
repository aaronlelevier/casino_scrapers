Questions
=========
1. Does ``TextField`` and ``CharField`` have no overhead difference when indexing?

2. Will ``Role`` be translated w/i the database and have multiple ``Role`` records, 
or will it be translated and archived w/i ".js" files?

3. Full text scan w/i PostgreSQL: Says to not use ``TextField``, b/c inefficient 
but to use ``CharField`` instead b/c the length can be limited.

4. Take a quick look at Capistrano, and check if it's worth looking at, or use 
SaltStack and work with Bill on putting it on the server

6. for ``/util/json_settings/role.json`` are "accept_assign" or "authorized_amount"
needed b/c these fields exist in the Person?

7. symlinks for prior deploy projects for simple rollbacks like in "capistrano"

    - postgres: creae a separage settings.py file: w/ credentials for staging
        - localhost