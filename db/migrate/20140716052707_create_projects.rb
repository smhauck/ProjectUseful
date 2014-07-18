class CreateProjects < ActiveRecord::Migration
  def change
    create_table :projects do |t|
      t.boolean :alive
      t.string :title
      t.text :description
      t.references :product, index: true

      t.timestamps
    end
  end
end
