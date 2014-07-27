class AddEstimatedHoursToTask < ActiveRecord::Migration
  def change
    add_column :tasks, :estimated_hours, :decimal, precision: 5, scale: 2
  end
end
