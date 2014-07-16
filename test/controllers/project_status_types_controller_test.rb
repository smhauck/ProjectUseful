require 'test_helper'

class ProjectStatusTypesControllerTest < ActionController::TestCase
  setup do
    @project_status_type = project_status_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:project_status_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create project_status_type" do
    assert_difference('ProjectStatusType.count') do
      post :create, project_status_type: { description: @project_status_type.description, title: @project_status_type.title }
    end

    assert_redirected_to project_status_type_path(assigns(:project_status_type))
  end

  test "should show project_status_type" do
    get :show, id: @project_status_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @project_status_type
    assert_response :success
  end

  test "should update project_status_type" do
    patch :update, id: @project_status_type, project_status_type: { description: @project_status_type.description, title: @project_status_type.title }
    assert_redirected_to project_status_type_path(assigns(:project_status_type))
  end

  test "should destroy project_status_type" do
    assert_difference('ProjectStatusType.count', -1) do
      delete :destroy, id: @project_status_type
    end

    assert_redirected_to project_status_types_path
  end
end
