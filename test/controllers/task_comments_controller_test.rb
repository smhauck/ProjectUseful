require 'test_helper'

class TaskCommentsControllerTest < ActionController::TestCase
  setup do
    @task_comment = task_comments(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:task_comments)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create task_comment" do
    assert_difference('TaskComment.count') do
      post :create, task_comment: { date_of_work: @task_comment.date_of_work, hours: @task_comment.hours, task_id: @task_comment.task_id, user_id: @task_comment.user_id }
    end

    assert_redirected_to task_comment_path(assigns(:task_comment))
  end

  test "should show task_comment" do
    get :show, id: @task_comment
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @task_comment
    assert_response :success
  end

  test "should update task_comment" do
    patch :update, id: @task_comment, task_comment: { date_of_work: @task_comment.date_of_work, hours: @task_comment.hours, task_id: @task_comment.task_id, user_id: @task_comment.user_id }
    assert_redirected_to task_comment_path(assigns(:task_comment))
  end

  test "should destroy task_comment" do
    assert_difference('TaskComment.count', -1) do
      delete :destroy, id: @task_comment
    end

    assert_redirected_to task_comments_path
  end
end
