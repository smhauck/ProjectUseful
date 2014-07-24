require 'test_helper'

class TaskAssignmentsControllerTest < ActionController::TestCase
  setup do
    @task_assignment = task_assignments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:task_assignments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create task_assignment" do
    assert_difference('TaskAssignment.count') do
      post :create, task_assignment: { task_id: @task_assignment.task_id, user_id: @task_assignment.user_id }
    end

    assert_redirected_to task_path(assigns(:task_id))
  end

  test "should show task_assignment" do
    get :show, id: @task_assignment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @task_assignment
    assert_response :success
  end

  test "should update task_assignment" do
    patch :update, id: @task_assignment, task_assignment: { task_id: @task_assignment.task_id, user_id: @task_assignment.user_id }
    assert_redirected_to task_assignment_path(assigns(:task_assignment))
  end

  test "should destroy task_assignment" do
    assert_difference('TaskAssignment.count', -1) do
      delete :destroy, id: @task_assignment
    end

  end
end
