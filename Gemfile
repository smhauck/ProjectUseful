# Copyright (C) 2025 Shannon M. Hauck, http://www.smhauck.com
# 
# This file is part of Project Useful.
# 
# Project Useful is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# Project Useful is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# 
# You should have received a copy of the GNU Affero General Public License
# along with Project Useful.  If not, see <http://www.gnu.org/licenses/>.



source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end



gem 'loofah', '~> 2.21'
gem 'rails-html-sanitizer', '>= 1.6'
gem 'bootsnap'
gem 'propshaft'
gem 'jsbundling-rails'
gem 'stimulus-rails'
gem 'cssbundling-rails'

gem "solid_cache"
gem "solid_queue"
gem "solid_cable"



# FIXME: Removed for Rails 8
# gem "webpacker"



# Use Puma as the app server
gem 'puma', '>= 5.0'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '>= 8.0.2'

gem 'simple_form', '~> 5.0'


# FIXME: removed for Rails 8
# Use SCSS for stylesheets
# gem 'sass-rails', '~> 5.0'


gem "nokogiri", ">= 1.11.0"

# FIXME: remove sprockets for rails 8
# gem 'sprockets', '~> 3.7.2'


# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# FIXME: remove for rails 8
# Use CoffeeScript for .coffee assets and views
# gem 'coffee-rails', '~> 4.2'


gem 'turbo-rails'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder'

group :doc do
  # bundle exec rake doc:rails generates the API under doc/api.
  gem 'sdoc', require: false
end

# Use ActiveModel has_secure_password
gem 'bcrypt', '~> 3.1.7'

# Database connector
gem "sqlite3", ">= 2.1"

# FIXME: remove carrierwave for rails 8
# File uploading through CarrierWave
# gem 'carrierwave'

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]


gem 'kamal', require: false
gem 'thruster', require: false
gem "image_processing", "~> 1.2"

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'web-console'
end



