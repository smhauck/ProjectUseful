require 'test_helper'

class ProductStatusTypesControllerTest < ActionController::TestCase
  setup do
    @product_status_type = product_status_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:product_status_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create product_status_type" do
    assert_difference('ProductStatusType.count') do
      post :create, product_status_type: { description: @product_status_type.description, title: @product_status_type.title }
    end

    assert_redirected_to product_status_type_path(assigns(:product_status_type))
  end

  test "should show product_status_type" do
    get :show, id: @product_status_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @product_status_type
    assert_response :success
  end

  test "should update product_status_type" do
    patch :update, id: @product_status_type, product_status_type: { description: @product_status_type.description, title: @product_status_type.title }
    assert_redirected_to product_status_type_path(assigns(:product_status_type))
  end

  test "should destroy product_status_type" do
    assert_difference('ProductStatusType.count', -1) do
      delete :destroy, id: @product_status_type
    end

    assert_redirected_to product_status_types_path
  end
end
