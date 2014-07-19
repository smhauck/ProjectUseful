class CreateSprints < ActiveRecord::Migration
  def change
    create_table :sprints do |t|
      t.date :start_date
      t.date :end_date
      t.boolean :alive
      t.text :notes

      t.timestamps
    end
  end
end
