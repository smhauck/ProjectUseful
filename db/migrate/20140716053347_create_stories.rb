class CreateStories < ActiveRecord::Migration
  def change
    create_table :stories do |t|
      t.boolean :alive
      t.string :title
      t.text :description
      t.references :product, index: true
      t.references :sprint, index: true

      t.timestamps
    end
  end
end
