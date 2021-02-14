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

class WikiPagesControllerTest < ActionController::TestCase
  setup do
    @wiki_page = wiki_pages(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:wiki_pages)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create wiki_page" do
    assert_difference('WikiPage.count') do
      post :create, wiki_page: { product_id: @wiki_page.product_id, story_id: @wiki_page.story_id, task_id: @wiki_page.task_id, user_id: @wiki_page.user_id, body: @wiki_page.body, title: @wiki_page.title, version: @wiki_page.version }
    end

    assert_redirected_to wiki_page_path(assigns(:wiki_page))
  end

  test "should show wiki_page" do
    get :show, id: @wiki_page
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @wiki_page
    assert_response :success
  end

  test "should update wiki_page" do
    patch :update, id: @wiki_page, wiki_page: { product_id: @wiki_page.product_id, story_id: @wiki_page.story_id, task_id: @wiki_page.task_id, user_id: @wiki_page.user_id, body: @wiki_page.body, title: @wiki_page.title, version: @wiki_page.version }
    assert_redirected_to wiki_page_path(assigns(:wiki_page))
  end

  test "should destroy wiki_page" do
    assert_difference('WikiPage.count', -1) do
      delete :destroy, id: @wiki_page
    end

    assert_redirected_to wiki_pages_path
  end
end
