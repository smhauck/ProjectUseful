class AddCreatorIdToStory < ActiveRecord::Migration[4.2]
  def change
    add_column :stories, :creator_id, :integer
  end
end
