require 'test_helper'

class EmailToSmsGatewaysControllerTest < ActionController::TestCase
  setup do
    @email_to_sms_gateway = email_to_sms_gateways(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:email_to_sms_gateways)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create email_to_sms_gateway" do
    assert_difference('EmailToSmsGateway.count') do
      post :create, email_to_sms_gateway: { active: @email_to_sms_gateway.active, address: @email_to_sms_gateway.address, description: @email_to_sms_gateway.description, name: @email_to_sms_gateway.name }
    end

    assert_redirected_to email_to_sms_gateway_path(assigns(:email_to_sms_gateway))
  end

  test "should show email_to_sms_gateway" do
    get :show, id: @email_to_sms_gateway
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @email_to_sms_gateway
    assert_response :success
  end

  test "should update email_to_sms_gateway" do
    patch :update, id: @email_to_sms_gateway, email_to_sms_gateway: { active: @email_to_sms_gateway.active, address: @email_to_sms_gateway.address, description: @email_to_sms_gateway.description, name: @email_to_sms_gateway.name }
    assert_redirected_to email_to_sms_gateway_path(assigns(:email_to_sms_gateway))
  end

  test "should destroy email_to_sms_gateway" do
    assert_difference('EmailToSmsGateway.count', -1) do
      delete :destroy, id: @email_to_sms_gateway
    end

    assert_redirected_to email_to_sms_gateways_path
  end
end
