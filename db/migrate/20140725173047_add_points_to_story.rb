class AddPointsToStory < ActiveRecord::Migration[4.2]
  def change
    add_column :stories, :points, :decimal, precision: 10, scale: 2
  end
end
