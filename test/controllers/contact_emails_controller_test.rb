# Copyright (C) 2020 Shannon M. Hauck, http://www.smhauck.com
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

class ContactEmailsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @contact_email = contact_emails(:one)
  end

  test "should get index" do
    get contact_emails_url
    assert_response :success
  end

  test "should get new" do
    get new_contact_email_url
    assert_response :success
  end

  test "should create contact_email" do
    assert_difference('ContactEmail.count') do
      post contact_emails_url, params: { contact_email: { address: @contact_email.address, contact_id: @contact_email.contact_id, email_type_id: @contact_email.email_type_id } }
    end

    assert_redirected_to contact_email_url(ContactEmail.last)
  end

  test "should show contact_email" do
    get contact_email_url(@contact_email)
    assert_response :success
  end

  test "should get edit" do
    get edit_contact_email_url(@contact_email)
    assert_response :success
  end

  test "should update contact_email" do
    patch contact_email_url(@contact_email), params: { contact_email: { address: @contact_email.address, contact_id: @contact_email.contact_id, email_type_id: @contact_email.email_type_id } }
    assert_redirected_to contact_email_url(@contact_email)
  end

  test "should destroy contact_email" do
    assert_difference('ContactEmail.count', -1) do
      delete contact_email_url(@contact_email)
    end

    assert_redirected_to contact_emails_url
  end
end
