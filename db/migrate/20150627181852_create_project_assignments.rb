class CreateProjectAssignments < ActiveRecord::Migration[4.2]
  def change
    create_table :project_assignments do |t|
      t.references :project, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true

      t.timestamps null: false
    end
  end
end
