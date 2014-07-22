class AddCompletionNoteToStory < ActiveRecord::Migration
  def change
    add_column :stories, :completion_notes, :text
  end
end
