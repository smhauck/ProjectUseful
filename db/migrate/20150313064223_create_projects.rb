class CreateProjects < ActiveRecord::Migration[4.2]
  def change
    create_table :projects do |t|
      t.string :title, null: false, default: "Project Title Is Required"
      t.text :description
      t.references :creator, class_name: User, null: false, default: 1, index: true
      t.references :owner, class_name: User, null: false, default: 1, index: true

      t.timestamps
    end
  end
end
