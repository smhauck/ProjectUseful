class ChangeBlogRemoveUserAddCreator < ActiveRecord::Migration[4.2]
  def change
    add_column :blogs, :creator_id, :integer
    remove_column :blogs, :user_id
  end
end
