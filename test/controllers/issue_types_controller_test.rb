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

class IssueTypesControllerTest < ActionController::TestCase
  setup do
    @issue_type = issue_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:issue_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create issue_type" do
    assert_difference('IssueType.count') do
      post :create, issue_type: { description: @issue_type.description, title: @issue_type.title }
    end

    assert_redirected_to issue_type_path(assigns(:issue_type))
  end

  test "should show issue_type" do
    get :show, id: @issue_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @issue_type
    assert_response :success
  end

  test "should update issue_type" do
    patch :update, id: @issue_type, issue_type: { description: @issue_type.description, title: @issue_type.title }
    assert_redirected_to issue_type_path(assigns(:issue_type))
  end

  test "should destroy issue_type" do
    assert_difference('IssueType.count', -1) do
      delete :destroy, id: @issue_type
    end

    assert_redirected_to issue_types_path
  end
end
