# Copyright (C) 2018 William B. Hauck, http://www.wbhauck.com
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
