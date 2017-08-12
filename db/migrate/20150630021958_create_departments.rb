class CreateDepartments < ActiveRecord::Migration[4.2]
  def change
    create_table :departments do |t|
      t.string :title
      t.text :description

      t.timestamps null: false
    end
  end
end
