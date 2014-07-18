class CreateSprints < ActiveRecord::Migration
  def change
    create_table :sprints do |t|
      t.date :start_date
      t.date :end_date
      t.boolean :alive
      t.string :title
      t.text :description
      t.references :product, index: true
      t.references :project, index: true

      t.timestamps
    end
  end
end
