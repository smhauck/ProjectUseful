require 'test_helper'

class StoryAssignmentsControllerTest < ActionController::TestCase
  setup do
    @story_assignment = story_assignments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:story_assignments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create story_assignment" do
    assert_difference('StoryAssignment.count') do
      post :create, story_assignment: { story_id: @story_assignment.story_id, user_id: @story_assignment.user_id }
    end

    assert_redirected_to story_assignment_path(assigns(:story_assignment))
  end

  test "should show story_assignment" do
    get :show, id: @story_assignment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @story_assignment
    assert_response :success
  end

  test "should update story_assignment" do
    patch :update, id: @story_assignment, story_assignment: { story_id: @story_assignment.story_id, user_id: @story_assignment.user_id }
    assert_redirected_to story_assignment_path(assigns(:story_assignment))
  end

  test "should destroy story_assignment" do
    assert_difference('StoryAssignment.count', -1) do
      delete :destroy, id: @story_assignment
    end

    assert_redirected_to story_assignments_path
  end
end
