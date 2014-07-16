class CreateSprintStatusTypes < ActiveRecord::Migration
  def change
    create_table :sprint_status_types do |t|
      t.string :title
      t.text :description

      t.timestamps
    end
  end
end
