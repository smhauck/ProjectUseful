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

class ProductsControllerTest < ActionDispatch::IntegrationTest

  setup do
    @product = products(:one)
    @user = User.create(username: 'john', contact_email:'john@example.com', password: 'password')
  end

#  test "should get index" do
#    get products_url
#    assert_response :success
#  end

  test "should get new" do
    sign_in_as(@user, 'password')
    get new_product_url
    assert_response :success
  end

#  test "should create product" do
#    assert_difference('Product.count') do
#      post products_url, params: { product: { alive: @product.alive, title: @product.title } }
#    end
#
#    assert_redirected_to product_path(assigns(:product))
#  end
#
#  test "should show product" do
#    get :show, id: @product
#    assert_response :success
#  end
#
#  test "should get edit" do
#    get :edit, id: @product
#    assert_response :success
#  end
#
#  test "should update product" do
#    patch :update, id: @product, product: { alive: @product.alive, description: @product.description, title: @product.title }
#    assert_redirected_to product_path(assigns(:product))
#  end
#
#  test "should destroy product" do
#    assert_difference('Product.count', -1) do
#      delete :destroy, id: @product
#    end
#
#    assert_redirected_to products_path
#  end


end
