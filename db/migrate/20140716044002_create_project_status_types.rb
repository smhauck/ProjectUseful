class CreateProjectStatusTypes < ActiveRecord::Migration
  def change
    create_table :project_status_types do |t|
      t.boolean :alive
      t.string :title
      t.text :description

      t.timestamps
    end

    ProjectStatusType.create(title: "Waiting", alive: "1")
    ProjectStatusType.create(title: "In Progress", alive: "1")
    ProjectStatusType.create(title: "Complete", alive: "0")

  end
end
