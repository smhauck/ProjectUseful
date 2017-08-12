class ChangeUserPhones < ActiveRecord::Migration[4.2]
  def change
    rename_column :users, :contact_phone, :office_phone
    add_column :users, :mobile_phone, :string
    add_reference :users, :email_to_sms_gateway, index: true, foreign_key: true
  end
end
