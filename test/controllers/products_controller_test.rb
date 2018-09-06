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
