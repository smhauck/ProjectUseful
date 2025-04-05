# Project Useful

Project Useful is a Ruby on Rails-based project management system implementing the Scrum Agile methodology.

## System Requirements

* Ruby version 3.4.1 or later
* Rails 8.0.2
* MySQL or MariaDB 5.1 or later

## Database
The system is being developed on a system using MySQL 5.1.46.  Later versions as well MariaDB should also work.

Create a database for production.  If you plan to do development or testing of the system you'll also need a corresponding database.

Create a user for Project Useful and grant all rights to the databases to the user.  Make sure to update your config/database.yml file with the appropriate database, username, and password.

## Installation
Make sure you update your secret token before running the application!
config/initializers/secret_token.rb

## Sections still to write

* Configuration

* Database initialization
The datatbase currently needs to be setup manually.  Login with admin privileges (root) and create a new database for Project Useful.  Then grant permissions to a new database user that you want to own the database.  Replace USER and PASSWORD with appropriate information.
    create database project_useful;
    grant all on projectuseful.* to 'USER'@'DATABASE_SERVER' identified by 'PASSWORD';

* Services (job queues, cache servers, search engines, etc.)

## Deployment instructions

I'm converting the system to deploy through [Kamal](https://kamal-deploy.org).

###  Older Deployment Process

ProjectUseful.org is currently running through Apache / Phusion Passenger.  Setup a virtual host for the application similar to the following:

    <VirtualHost *:80>
        ServerName "www.DOMAINNAME.org"
        ServerAlias "DOMAINNAME.org"
        DocumentRoot /path/to/project_useful/public
        ErrorLog "logs/www.DOMAINNAME.org-error_log"
        CustomLog "logs/www.DOMAINNAME.org-access_log" common
        RailsBaseURI /rails
        <Directory "/path/to/project_useful/public">
          Options FollowSymLinks Includes
          AllowOverride None
          Order deny,allow
          Allow from all
        </Directory>
    </VirtualHost>


## Author, Copyright, and License

Project Useful is Copyright 2025 by [Shannon M. Hauck](https://github.com/smhauck)

Project Useful is released under the GNU Affero General Public License.  See the [LICENSE](LICENSE) file for details.
