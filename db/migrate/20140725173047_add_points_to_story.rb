class AddPointsToStory < ActiveRecord::Migration
  def change
    add_column :stories, :points, :decimal, precision: 10, scale: 2
  end
end
