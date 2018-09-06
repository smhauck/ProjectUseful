ENV["RAILS_ENV"] ||= "test"
require_relative '../config/environment'
require 'rails/test_help'

class ActiveSupport::TestCase

  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  fixtures :all

  # Add more helper methods to be used by all tests here...


  def sign_in_as(user, password)
    post login_path, params: { session: { contact_email: user.contact_email, password: password } }
  end



end
