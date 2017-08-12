class AddStoryTypeToStory < ActiveRecord::Migration[4.2]
  def change
    add_reference :stories, :story_type, index: true
  end
end
