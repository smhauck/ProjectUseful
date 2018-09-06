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

class ProjectCommentsControllerTest < ActionController::TestCase
  setup do
    @project_comment = project_comments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:project_comments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create project_comment" do
    assert_difference('ProjectComment.count') do
      post :create, project_comment: { comment: @project_comment.comment, project_id: @project_comment.project_id, user_id: @project_comment.user_id }
    end

    assert_redirected_to project_comment_path(assigns(:project_comment))
  end

  test "should show project_comment" do
    get :show, id: @project_comment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @project_comment
    assert_response :success
  end

  test "should update project_comment" do
    patch :update, id: @project_comment, project_comment: { comment: @project_comment.comment, project_id: @project_comment.project_id, user_id: @project_comment.user_id }
    assert_redirected_to project_comment_path(assigns(:project_comment))
  end

  test "should destroy project_comment" do
    assert_difference('ProjectComment.count', -1) do
      delete :destroy, id: @project_comment
    end

    assert_redirected_to project_comments_path
  end
end
