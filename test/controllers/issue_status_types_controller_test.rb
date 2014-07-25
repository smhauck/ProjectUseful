require 'test_helper'

class IssueStatusTypesControllerTest < ActionController::TestCase
  setup do
    @issue_status_type = issue_status_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:issue_status_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create issue_status_type" do
    assert_difference('IssueStatusType.count') do
      post :create, issue_status_type: { code: @issue_status_type.code, description: @issue_status_type.description, title: @issue_status_type.title }
    end

    assert_redirected_to issue_status_type_path(assigns(:issue_status_type))
  end

  test "should show issue_status_type" do
    get :show, id: @issue_status_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @issue_status_type
    assert_response :success
  end

  test "should update issue_status_type" do
    patch :update, id: @issue_status_type, issue_status_type: { code: @issue_status_type.code, description: @issue_status_type.description, title: @issue_status_type.title }
    assert_redirected_to issue_status_type_path(assigns(:issue_status_type))
  end

  test "should destroy issue_status_type" do
    assert_difference('IssueStatusType.count', -1) do
      delete :destroy, id: @issue_status_type
    end

    assert_redirected_to issue_status_types_path
  end
end
