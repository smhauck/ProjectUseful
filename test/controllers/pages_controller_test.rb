require 'test_helper'

class PagesControllerTest < ActionController::TestCase
  test "should get license" do
    get :license
    assert_response :success
  end

  test "should get technology" do
    get :technology
    assert_response :success
  end

end
