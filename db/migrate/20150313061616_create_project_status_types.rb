class CreateProjectStatusTypes < ActiveRecord::Migration
  def change
    create_table :project_status_types do |t|
      t.boolean :alive, null: false, default: true
      t.string :code, null: false, default: "FIXME"
      t.string :title, null: false, default: "Project Title Is Required"
      t.text :description

      t.timestamps
    end
  end
end
