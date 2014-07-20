class AddStoryStatusTypeToStory < ActiveRecord::Migration
  def change
    add_reference :stories, :story_status_type, index: true
  end
end
