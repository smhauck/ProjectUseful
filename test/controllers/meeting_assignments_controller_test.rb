require 'test_helper'

class MeetingAssignmentsControllerTest < ActionController::TestCase
  setup do
    @meeting_assignment = meeting_assignments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:meeting_assignments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create meeting_assignment" do
    assert_difference('MeetingAssignment.count') do
      post :create, meeting_assignment: { meeting_id: @meeting_assignment.meeting_id, user_id: @meeting_assignment.user_id }
    end

    assert_redirected_to meeting_assignment_path(assigns(:meeting_assignment))
  end

  test "should show meeting_assignment" do
    get :show, id: @meeting_assignment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @meeting_assignment
    assert_response :success
  end

  test "should update meeting_assignment" do
    patch :update, id: @meeting_assignment, meeting_assignment: { meeting_id: @meeting_assignment.meeting_id, user_id: @meeting_assignment.user_id }
    assert_redirected_to meeting_assignment_path(assigns(:meeting_assignment))
  end

  test "should destroy meeting_assignment" do
    assert_difference('MeetingAssignment.count', -1) do
      delete :destroy, id: @meeting_assignment
    end

    assert_redirected_to meeting_assignments_path
  end
end
