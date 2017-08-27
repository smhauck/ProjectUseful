class CreateContactEmails < ActiveRecord::Migration[5.1]
  def change
    create_table :contact_emails do |t|
      t.string :address
      t.references :contact, foreign_key: true
      t.references :email_type, foreign_key: true

      t.timestamps
    end
  end
end
