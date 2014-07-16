require 'test_helper'

class SprintStatusTypesControllerTest < ActionController::TestCase
  setup do
    @sprint_status_type = sprint_status_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:sprint_status_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create sprint_status_type" do
    assert_difference('SprintStatusType.count') do
      post :create, sprint_status_type: { description: @sprint_status_type.description, title: @sprint_status_type.title }
    end

    assert_redirected_to sprint_status_type_path(assigns(:sprint_status_type))
  end

  test "should show sprint_status_type" do
    get :show, id: @sprint_status_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @sprint_status_type
    assert_response :success
  end

  test "should update sprint_status_type" do
    patch :update, id: @sprint_status_type, sprint_status_type: { description: @sprint_status_type.description, title: @sprint_status_type.title }
    assert_redirected_to sprint_status_type_path(assigns(:sprint_status_type))
  end

  test "should destroy sprint_status_type" do
    assert_difference('SprintStatusType.count', -1) do
      delete :destroy, id: @sprint_status_type
    end

    assert_redirected_to sprint_status_types_path
  end
end
