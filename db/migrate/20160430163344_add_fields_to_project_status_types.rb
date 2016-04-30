class AddFieldsToProjectStatusTypes < ActiveRecord::Migration
  def change
    add_column :project_status_types, :background_color, :string
    add_column :project_status_types, :text_color, :string
  end
end
