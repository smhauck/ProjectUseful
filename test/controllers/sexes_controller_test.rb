require 'test_helper'

class SexesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @sex = sexes(:one)
  end

  test "should get index" do
    get sexes_url
    assert_response :success
  end

  test "should get new" do
    get new_sex_url
    assert_response :success
  end

  test "should create sex" do
    assert_difference('Sex.count') do
      post sexes_url, params: { sex: { active: @sex.active, description: @sex.description, name: @sex.name } }
    end

    assert_redirected_to sex_url(Sex.last)
  end

  test "should show sex" do
    get sex_url(@sex)
    assert_response :success
  end

  test "should get edit" do
    get edit_sex_url(@sex)
    assert_response :success
  end

  test "should update sex" do
    patch sex_url(@sex), params: { sex: { active: @sex.active, description: @sex.description, name: @sex.name } }
    assert_redirected_to sex_url(@sex)
  end

  test "should destroy sex" do
    assert_difference('Sex.count', -1) do
      delete sex_url(@sex)
    end

    assert_redirected_to sexes_url
  end
end
