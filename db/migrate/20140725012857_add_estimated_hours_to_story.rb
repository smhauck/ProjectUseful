class AddEstimatedHoursToStory < ActiveRecord::Migration
  def change
    add_column :stories, :estimated_hours, :decimal, precision: 10, scale: 2
  end
end
