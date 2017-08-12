class CreateSlas < ActiveRecord::Migration[4.2]
  def change
    create_table :slas do |t|
      t.string :name
      t.text :description
      t.references :product, index: true
      t.integer :response_due_at
      t.integer :workaround_due_at
      t.integer :solution_due_at

      t.timestamps null: false
    end
  end
end
