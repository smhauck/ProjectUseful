class CreateEmailToSmsGateways < ActiveRecord::Migration[4.2]
  def change
    create_table :email_to_sms_gateways do |t|
      t.string :name, null: false
      t.string :address, null: false
      t.text :description
      t.boolean :active, null: false, default: true

      t.timestamps null: false
    end
  end
end
