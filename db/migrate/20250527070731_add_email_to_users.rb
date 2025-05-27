class AddEmailToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :email_address, :string
    add_index :users, :email_address, unique: true
    add_index :users, :username, unique: true
  end
end
