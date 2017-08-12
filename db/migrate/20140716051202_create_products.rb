class CreateProducts < ActiveRecord::Migration[4.2]
  def change
    create_table :products do |t|
      t.boolean :alive
      t.string :title
      t.text :description

      t.timestamps
    end
  end
end
