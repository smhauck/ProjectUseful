require 'test_helper'

class StoryStatusTypesControllerTest < ActionController::TestCase
  setup do
    @story_status_type = story_status_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:story_status_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create story_status_type" do
    assert_difference('StoryStatusType.count') do
      post :create, story_status_type: { description: @story_status_type.description, title: @story_status_type.title }
    end

    assert_redirected_to story_status_type_path(assigns(:story_status_type))
  end

  test "should show story_status_type" do
    get :show, id: @story_status_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @story_status_type
    assert_response :success
  end

  test "should update story_status_type" do
    patch :update, id: @story_status_type, story_status_type: { description: @story_status_type.description, title: @story_status_type.title }
    assert_redirected_to story_status_type_path(assigns(:story_status_type))
  end

  test "should destroy story_status_type" do
    assert_difference('StoryStatusType.count', -1) do
      delete :destroy, id: @story_status_type
    end

    assert_redirected_to story_status_types_path
  end
end
