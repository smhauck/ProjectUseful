require 'test_helper'

class EmailTypesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @email_type = email_types(:one)
  end

  test "should get index" do
    get email_types_url
    assert_response :success
  end

  test "should get new" do
    get new_email_type_url
    assert_response :success
  end

  test "should create email_type" do
    assert_difference('EmailType.count') do
      post email_types_url, params: { email_type: { description: @email_type.description, name: @email_type.name } }
    end

    assert_redirected_to email_type_url(EmailType.last)
  end

  test "should show email_type" do
    get email_type_url(@email_type)
    assert_response :success
  end

  test "should get edit" do
    get edit_email_type_url(@email_type)
    assert_response :success
  end

  test "should update email_type" do
    patch email_type_url(@email_type), params: { email_type: { description: @email_type.description, name: @email_type.name } }
    assert_redirected_to email_type_url(@email_type)
  end

  test "should destroy email_type" do
    assert_difference('EmailType.count', -1) do
      delete email_type_url(@email_type)
    end

    assert_redirected_to email_types_url
  end
end
