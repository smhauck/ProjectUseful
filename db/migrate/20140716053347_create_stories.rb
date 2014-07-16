class CreateStories < ActiveRecord::Migration
  def change
    create_table :stories do |t|
      t.boolean :alive
      t.string :title
      t.text :description
      t.references :Product, index: true
      t.references :Project, index: true
      t.references :Sprint, index: true

      t.timestamps
    end
  end
end
