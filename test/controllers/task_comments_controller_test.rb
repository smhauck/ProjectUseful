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

class TaskCommentsControllerTest < ActionController::TestCase
  setup do
    @task_comment = task_comments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:task_comments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create task_comment" do
    assert_difference('TaskComment.count') do
      post :create, task_comment: { date_of_work: @task_comment.date_of_work, hours: @task_comment.hours, task_id: @task_comment.task_id, user_id: @task_comment.user_id }
    end

    assert_redirected_to task_comment_path(assigns(:task_comment))
  end

  test "should show task_comment" do
    get :show, id: @task_comment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @task_comment
    assert_response :success
  end

  test "should update task_comment" do
    patch :update, id: @task_comment, task_comment: { date_of_work: @task_comment.date_of_work, hours: @task_comment.hours, task_id: @task_comment.task_id, user_id: @task_comment.user_id }
    assert_redirected_to task_comment_path(assigns(:task_comment))
  end

  test "should destroy task_comment" do
    assert_difference('TaskComment.count', -1) do
      delete :destroy, id: @task_comment
    end

    assert_redirected_to task_comments_path
  end
end
