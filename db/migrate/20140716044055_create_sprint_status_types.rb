class CreateSprintStatusTypes < ActiveRecord::Migration
  def up
    create_table :sprint_status_types do |t|
      t.boolean :alive
      t.string :title
      t.text :description

      t.timestamps
    end

    SprintStatusType.create(title: "Waiting", alive: "1")
    SprintStatusType.create(title: "In Progress", alive: "1")
    SprintStatusType.create(title: "Complete", alive: "0")
    SprintStatusType.create(title: "Cancelled", alive: "0")
    SprintStatusType.create(title: "Deleted", alive: "0")

  end

  def down
    drop_table :sprint_status_types
  end

end
