require 'test_helper'

class ProjectAssignmentsControllerTest < ActionController::TestCase
  setup do
    @project_assignment = project_assignments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:project_assignments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create project_assignment" do
    assert_difference('ProjectAssignment.count') do
      post :create, project_assignment: { project_id: @project_assignment.project_id, user_id: @project_assignment.user_id }
    end

    assert_redirected_to project_assignment_path(assigns(:project_assignment))
  end

  test "should show project_assignment" do
    get :show, id: @project_assignment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @project_assignment
    assert_response :success
  end

  test "should update project_assignment" do
    patch :update, id: @project_assignment, project_assignment: { project_id: @project_assignment.project_id, user_id: @project_assignment.user_id }
    assert_redirected_to project_assignment_path(assigns(:project_assignment))
  end

  test "should destroy project_assignment" do
    assert_difference('ProjectAssignment.count', -1) do
      delete :destroy, id: @project_assignment
    end

    assert_redirected_to project_assignments_path
  end
end
