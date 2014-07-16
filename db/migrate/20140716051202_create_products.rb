class CreateProducts < ActiveRecord::Migration
  def change
    create_table :products do |t|
      t.boolean :alive
      t.string :title
      t.text :description

      t.timestamps
    end
  end
end
