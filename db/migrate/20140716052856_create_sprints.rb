class CreateSprints < ActiveRecord::Migration
  def change
    create_table :sprints do |t|
      t.boolean :alive
      t.string :title
      t.text :description
      t.references :Product, index: true
      t.references :Project, index: true

      t.timestamps
    end
  end
end
