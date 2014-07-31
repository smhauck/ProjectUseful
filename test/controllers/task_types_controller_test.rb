require 'test_helper'

class TaskTypesControllerTest < ActionController::TestCase
  setup do
    @task_type = task_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:task_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create task_type" do
    assert_difference('TaskType.count') do
      post :create, task_type: { description: @task_type.description, title: @task_type.title }
    end

    assert_redirected_to task_type_path(assigns(:task_type))
  end

  test "should show task_type" do
    get :show, id: @task_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @task_type
    assert_response :success
  end

  test "should update task_type" do
    patch :update, id: @task_type, task_type: { description: @task_type.description, title: @task_type.title }
    assert_redirected_to task_type_path(assigns(:task_type))
  end

  test "should destroy task_type" do
    assert_difference('TaskType.count', -1) do
      delete :destroy, id: @task_type
    end

    assert_redirected_to task_types_path
  end
end
