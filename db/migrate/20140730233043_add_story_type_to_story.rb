class AddStoryTypeToStory < ActiveRecord::Migration
  def change
    add_reference :stories, :story_type, index: true
  end
end
