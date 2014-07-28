class AddFieldsToUser < ActiveRecord::Migration
  def change
    add_column :users, :first_name, :string
    add_column :users, :last_name, :string
    add_column :users, :contact_phone, :string
    add_column :users, :contact_email, :string, null: false
  end
end
