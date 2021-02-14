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

class TaskTypesControllerTest < ActionController::TestCase
  setup do
    @task_type = task_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:task_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create task_type" do
    assert_difference('TaskType.count') do
      post :create, task_type: { description: @task_type.description, title: @task_type.title }
    end

    assert_redirected_to task_type_path(assigns(:task_type))
  end

  test "should show task_type" do
    get :show, id: @task_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @task_type
    assert_response :success
  end

  test "should update task_type" do
    patch :update, id: @task_type, task_type: { description: @task_type.description, title: @task_type.title }
    assert_redirected_to task_type_path(assigns(:task_type))
  end

  test "should destroy task_type" do
    assert_difference('TaskType.count', -1) do
      delete :destroy, id: @task_type
    end

    assert_redirected_to task_types_path
  end
end
