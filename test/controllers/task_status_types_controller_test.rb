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

class TaskStatusTypesControllerTest < ActionController::TestCase
  setup do
    @task_status_type = task_status_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:task_status_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create task_status_type" do
    assert_difference('TaskStatusType.count') do
      post :create, task_status_type: { description: @task_status_type.description, title: @task_status_type.title }
    end

    assert_redirected_to task_status_type_path(assigns(:task_status_type))
  end

  test "should show task_status_type" do
    get :show, id: @task_status_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @task_status_type
    assert_response :success
  end

  test "should update task_status_type" do
    patch :update, id: @task_status_type, task_status_type: { description: @task_status_type.description, title: @task_status_type.title }
    assert_redirected_to task_status_type_path(assigns(:task_status_type))
  end

  test "should destroy task_status_type" do
    assert_difference('TaskStatusType.count', -1) do
      delete :destroy, id: @task_status_type
    end

    assert_redirected_to task_status_types_path
  end
end
