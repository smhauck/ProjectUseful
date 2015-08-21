class CreateProjectStatusTypes < ActiveRecord::Migration
  def change
    create_table :project_status_types do |t|
      t.string :title, null: false
      t.boolean :alive, null: false, default: true
      t.text :description

      t.timestamps null: false
    end
  end
end
