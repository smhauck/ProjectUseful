require 'test_helper'

class NotePrivacyTypesControllerTest < ActionController::TestCase
  setup do
    @note_privacy_type = note_privacy_types(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:note_privacy_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create note_privacy_type" do
    assert_difference('NotePrivacyType.count') do
      post :create, note_privacy_type: { code: @note_privacy_type.code, description: @note_privacy_type.description, title: @note_privacy_type.title }
    end

    assert_redirected_to note_privacy_type_path(assigns(:note_privacy_type))
  end

  test "should show note_privacy_type" do
    get :show, id: @note_privacy_type
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @note_privacy_type
    assert_response :success
  end

  test "should update note_privacy_type" do
    patch :update, id: @note_privacy_type, note_privacy_type: { code: @note_privacy_type.code, description: @note_privacy_type.description, title: @note_privacy_type.title }
    assert_redirected_to note_privacy_type_path(assigns(:note_privacy_type))
  end

  test "should destroy note_privacy_type" do
    assert_difference('NotePrivacyType.count', -1) do
      delete :destroy, id: @note_privacy_type
    end

    assert_redirected_to note_privacy_types_path
  end
end
