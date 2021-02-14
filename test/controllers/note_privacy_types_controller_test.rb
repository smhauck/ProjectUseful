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

class NotePrivacyTypesControllerTest < ActionController::TestCase
  setup do
    @note_privacy_type = note_privacy_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:note_privacy_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create note_privacy_type" do
    assert_difference('NotePrivacyType.count') do
      post :create, note_privacy_type: { code: @note_privacy_type.code, description: @note_privacy_type.description, title: @note_privacy_type.title }
    end

    assert_redirected_to note_privacy_type_path(assigns(:note_privacy_type))
  end

  test "should show note_privacy_type" do
    get :show, id: @note_privacy_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @note_privacy_type
    assert_response :success
  end

  test "should update note_privacy_type" do
    patch :update, id: @note_privacy_type, note_privacy_type: { code: @note_privacy_type.code, description: @note_privacy_type.description, title: @note_privacy_type.title }
    assert_redirected_to note_privacy_type_path(assigns(:note_privacy_type))
  end

  test "should destroy note_privacy_type" do
    assert_difference('NotePrivacyType.count', -1) do
      delete :destroy, id: @note_privacy_type
    end

    assert_redirected_to note_privacy_types_path
  end
end
