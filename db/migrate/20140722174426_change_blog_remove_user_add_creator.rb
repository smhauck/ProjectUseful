class ChangeBlogRemoveUserAddCreator < ActiveRecord::Migration
  def change
    add_column :blogs, :creator_id, :integer
    remove_column :blogs, :user_id
  end
end
