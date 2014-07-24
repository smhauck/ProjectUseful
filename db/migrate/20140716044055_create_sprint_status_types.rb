class CreateSprintStatusTypes < ActiveRecord::Migration
  def up
    create_table :sprint_status_types do |t|
      t.boolean :alive
      t.string :title
      t.text :description

      t.timestamps
    end
  end

  def down
    drop_table :sprint_status_types
  end

end
