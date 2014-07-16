class CreateTasks < ActiveRecord::Migration
  def change
    create_table :tasks do |t|
      t.boolean :alive
      t.string :title
      t.text :description
      t.references :Product, index: true
      t.references :Project, index: true
      t.references :Sprint, index: true
      t.references :Story, index: true

      t.timestamps
    end
  end
end
