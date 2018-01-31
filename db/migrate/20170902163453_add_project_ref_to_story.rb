class AddProjectRefToStory < ActiveRecord::Migration[5.1]
  def change
    add_reference :stories, :project, foreign_key: true
  end
end
