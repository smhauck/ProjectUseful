require 'test_helper'

class ProjectCommentsControllerTest < ActionController::TestCase
  setup do
    @project_comment = project_comments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:project_comments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create project_comment" do
    assert_difference('ProjectComment.count') do
      post :create, project_comment: { comment: @project_comment.comment, project_id: @project_comment.project_id, user_id: @project_comment.user_id }
    end

    assert_redirected_to project_comment_path(assigns(:project_comment))
  end

  test "should show project_comment" do
    get :show, id: @project_comment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @project_comment
    assert_response :success
  end

  test "should update project_comment" do
    patch :update, id: @project_comment, project_comment: { comment: @project_comment.comment, project_id: @project_comment.project_id, user_id: @project_comment.user_id }
    assert_redirected_to project_comment_path(assigns(:project_comment))
  end

  test "should destroy project_comment" do
    assert_difference('ProjectComment.count', -1) do
      delete :destroy, id: @project_comment
    end

    assert_redirected_to project_comments_path
  end
end
