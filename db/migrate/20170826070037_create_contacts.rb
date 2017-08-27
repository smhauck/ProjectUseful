class CreateContacts < ActiveRecord::Migration[5.1]
  def change
    create_table :contacts do |t|
      t.string :first_name
      t.string :middle_name
      t.string :last_name
      t.string :prefix
      t.string :suffix
      t.references :sex, foreign_key: true

      t.timestamps
    end
  end
end
