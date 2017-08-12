class AddEstimatedHoursToTask < ActiveRecord::Migration[4.2]
  def change
    add_column :tasks, :estimated_hours, :decimal, precision: 5, scale: 2
  end
end
