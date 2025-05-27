class AddNotNullToUsers < ActiveRecord::Migration[8.0]
  def change
    change_column_null(:users, :email_address, false)
  end
end
