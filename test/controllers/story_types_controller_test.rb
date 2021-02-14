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

class StoryTypesControllerTest < ActionController::TestCase
  setup do
    @story_type = story_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:story_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create story_type" do
    assert_difference('StoryType.count') do
      post :create, story_type: { description: @story_type.description, title: @story_type.title }
    end

    assert_redirected_to story_type_path(assigns(:story_type))
  end

  test "should show story_type" do
    get :show, id: @story_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @story_type
    assert_response :success
  end

  test "should update story_type" do
    patch :update, id: @story_type, story_type: { description: @story_type.description, title: @story_type.title }
    assert_redirected_to story_type_path(assigns(:story_type))
  end

  test "should destroy story_type" do
    assert_difference('StoryType.count', -1) do
      delete :destroy, id: @story_type
    end

    assert_redirected_to story_types_path
  end
end
