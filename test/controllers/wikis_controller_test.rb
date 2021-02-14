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

class WikisControllerTest < ActionController::TestCase
  setup do
    @wiki = wikis(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:wikis)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create wiki" do
    assert_difference('Wiki.count') do
      post :create, wiki: { description: @wiki.description, title: @wiki.title }
    end

    assert_redirected_to wiki_path(assigns(:wiki))
  end

  test "should show wiki" do
    get :show, id: @wiki
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @wiki
    assert_response :success
  end

  test "should update wiki" do
    patch :update, id: @wiki, wiki: { description: @wiki.description, title: @wiki.title }
    assert_redirected_to wiki_path(assigns(:wiki))
  end

  test "should destroy wiki" do
    assert_difference('Wiki.count', -1) do
      delete :destroy, id: @wiki
    end

    assert_redirected_to wikis_path
  end
end
