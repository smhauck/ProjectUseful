class AddNickNameToUser < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :nick_name, :string
  end
end
